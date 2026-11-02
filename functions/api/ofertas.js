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

  try {
    const resultado = await env.DB.prepare(`
      SELECT id, texto, fecha_publicacion, publicado_por, estado
      FROM ofertas
      WHERE (estado IS NULL OR estado = 'publicada')
      ORDER BY fecha_publicacion DESC
    `).all();

    const ahora = new Date();
    // Ampliar vigencia a 30 días para no perder ofertas recientes del grupo
    const limite = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);

    const ofertas = (resultado.results || [])
      .map(oferta => {
        const d = parseFecha(oferta.fecha_publicacion);
        // Si la fecha venía en formato antiguo DD/MM/YYYY, sanearla en D1 silenciosamente
        if (d && String(oferta.fecha_publicacion).includes('/')) {
          try {
            env.DB.prepare("UPDATE ofertas SET fecha_publicacion = ? WHERE id = ?")
              .bind(d.toISOString(), oferta.id)
              .run();
          } catch(e) {}
        }
        return {
          ...oferta,
          fecha_publicacion: d ? d.toISOString() : oferta.fecha_publicacion,
          _timestamp: d ? d.getTime() : 0
        };
      })
      .filter(oferta => {
        return oferta._timestamp && oferta._timestamp >= limite.getTime() && oferta._timestamp <= (ahora.getTime() + 86400000);
      })
      .sort((a, b) => b._timestamp - a._timestamp)
      .map(({ _timestamp, ...resto }) => resto);

    return Response.json({ ok: true, ofertas }, { status: 200 });
  } catch (error) {
    console.error("Error consultando ofertas:", error);
    return Response.json(
      { error: "Error al consultar las ofertas", detail: error.message },
      { status: 500 }
    );
  }
}
