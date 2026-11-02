// functions/api/ofertas.js — Cloudflare Pages Function con D1
async function crearToken(password) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const firma = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("grupo-uach-session")
  );

  return Array.from(new Uint8Array(firma))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseFecha(fecha) {
  if (!fecha) return null;
  const s = String(fecha).trim();
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d;

  const match = s.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );
  if (!match) return null;

  const [, dia, mes, anio, hora = "12", minuto = "00", segundo = "00"] = match;
  const custom = new Date(Number(anio), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
  return isNaN(custom.getTime()) ? null : custom;
}

export async function onRequestGet({ request, env }) {
  const appPassword = env.APP_PASSWORD || "miraflores";
  if (!env.DB) {
    return Response.json(
      { error: "Falta configurar la conexión D1" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("Authorization") || "";
  const tokenEsperado = await crearToken(appPassword);

  if (auth !== `Bearer ${tokenEsperado}`) {
    return Response.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  // Migraciones automáticas idempotentes
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN cargo TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN ciudad TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN empresa TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN experiencia TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN tipo_postulacion TEXT DEFAULT 'interno'").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN contacto_nombre TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN contacto_fono TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN contacto_email TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN publicado_por_fono TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN fecha_verificacion TEXT DEFAULT ''").run(); } catch(e) {}

  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS metricas_ofertas (
        clave TEXT PRIMARY KEY,
        valor INTEGER DEFAULT 0
      )
    `).run();
    await env.DB.prepare(`
      INSERT OR IGNORE INTO metricas_ofertas (clave, valor) VALUES ('total_busquedas', 28)
    `).run();
  } catch(e) {}

  try {
    // Obtenemos todas las ofertas que no hayan sido eliminadas físicamente
    const resultado = await env.DB.prepare(`
      SELECT id, texto, fecha_publicacion, publicado_por, estado,
             COALESCE(cargo, '') as cargo,
             COALESCE(ciudad, '') as ciudad,
             COALESCE(empresa, '') as empresa,
             COALESCE(experiencia, '') as experiencia,
             COALESCE(tipo_postulacion, 'interno') as tipo_postulacion,
             COALESCE(contacto_nombre, '') as contacto_nombre,
             COALESCE(contacto_fono, '') as contacto_fono,
             COALESCE(contacto_email, '') as contacto_email,
             COALESCE(publicado_por_fono, '') as publicado_por_fono,
             COALESCE(fecha_verificacion, '') as fecha_verificacion
      FROM ofertas
      WHERE (estado IS NULL OR estado != 'eliminada')
    `).all();

    let totalBusquedas = 28;
    try {
      const mRow = await env.DB.prepare("SELECT valor FROM metricas_ofertas WHERE clave = 'total_busquedas'").first();
      if (mRow && mRow.valor !== undefined) totalBusquedas = Number(mRow.valor);
    } catch(e) {}

    const ahora = new Date();

    const ofertas = (resultado.results || [])
      .map(oferta => {
        const d = parseFecha(oferta.fecha_publicacion);
        if (d && String(oferta.fecha_publicacion).includes('/')) {
          try {
            env.DB.prepare("UPDATE ofertas SET fecha_publicacion = ? WHERE id = ?")
              .bind(d.toISOString(), oferta.id)
              .run();
          } catch(e) {}
        }
        const ts = d ? d.getTime() : 0;
        const diasTranscurridos = ts ? Math.floor((ahora.getTime() - ts) / (1000 * 60 * 60 * 24)) : 0;
        return {
          ...oferta,
          fecha_publicacion: d ? d.toISOString() : oferta.fecha_publicacion,
          dias_transcurridos: Math.max(0, diasTranscurridos),
          _timestamp: ts
        };
      })
      // Orden: ACTIVAS PRIMERO (estado 'publicada' o null), luego las CUBIERTAS/BLOQUEADAS abajo.
      // Dentro de cada grupo, orden por fecha más reciente.
      .sort((a, b) => {
        const aActiva = (!a.estado || a.estado === 'publicada') ? 1 : 0;
        const bActiva = (!b.estado || b.estado === 'publicada') ? 1 : 0;
        if (aActiva !== bActiva) return bActiva - aActiva;
        return (b._timestamp || 0) - (a._timestamp || 0);
      })
      .map(({ _timestamp, ...resto }) => resto);

    const activas = ofertas.filter(o => !o.estado || o.estado === 'publicada').length;
    const cubiertas = ofertas.filter(o => o.estado === 'cubierta' || o.estado === 'bloqueada').length;

    return Response.json({
      ok: true,
      ofertas,
      stats: {
        total: ofertas.length,
        activas,
        cubiertas,
        busquedas: totalBusquedas
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error consultando ofertas:", error);
    return Response.json(
      { error: "Error al consultar las ofertas", detail: error.message },
      { status: 500 }
    );
  }
}
