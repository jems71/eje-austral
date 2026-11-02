// functions/api/agregar.js — Cloudflare Pages Function con D1

async function crearAdminToken(password) {
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
    encoder.encode("grupo-uach-admin-session")
  );
  return Array.from(new Uint8Array(firma))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    // Asegurar columnas de autoría y auditoría en la tabla contactos
    try { await env.DB.prepare("ALTER TABLE contactos ADD COLUMN creado_por TEXT DEFAULT 'colega_web'").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE contactos ADD COLUMN creador_ciudad TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE contactos ADD COLUMN creador_wa TEXT DEFAULT ''").run(); } catch(e) {}

    const body = await request.json().catch(() => ({}));
    if (!body || !body.nombre || !body.nombre.trim()) {
      return Response.json({ error: 'El campo "nombre" es obligatorio' }, { status: 400 });
    }

    // Verificar si quien crea el contacto es el Administrador mediante token HMAC
    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    let esAdmin = false;
    try {
      const tokenEsperado = await crearAdminToken(adminPassword);
      if (auth === `Bearer ${tokenEsperado}`) {
        esAdmin = true;
      }
    } catch(e) {}

    const creadoPor = esAdmin ? 'admin' : 'colega_web';

    // Captura de ciudad de origen (Cloudflare edge)
    const creadorCiudad = request.cf?.city || request.headers.get('cf-ipcity') || '';

    // Extraer y validar WhatsApp de quien recomienda / aporta el contacto
    let creadorWa = String(body.creador_wa || '').trim();
    if (!creadorWa) {
      const recomRaw = String(body.recomendadoPor || body.recomendado_por || '');
      const matchWa = recomRaw.match(/(?:\+?56)?\s*9\s*\d{3,4}\s*\d{4}/);
      if (matchWa) {
        creadorWa = matchWa[0].replace(/\s+/g, '');
      }
    }

    // Para colegas de la web, exigir WhatsApp de respaldo si no es admin
    if (!esAdmin && (!creadorWa || creadorWa.replace(/\D/g, '').length < 8)) {
      return Response.json({
        error: 'El número de WhatsApp de quien aporta el contacto es un requisito obligatorio (+56 9 ...)'
      }, { status: 400 });
    }

    // Verificar si el contacto solicitó previamente estar bloqueado del directorio
    const fonoDigits = String(body.fono || '').replace(/\D/g, '');
    const waDigits = String(body.whatsapp || '').replace(/\D/g, '');
    const sigDigitsFono = fonoDigits.length >= 8 ? fonoDigits.slice(-8) : '';
    const sigDigitsWa = waDigits.length >= 8 ? waDigits.slice(-8) : '';

    if (sigDigitsFono || sigDigitsWa) {
      const bloq = await env.DB.prepare(`
        SELECT nombre FROM contactos 
        WHERE estado_publicacion = 'bloqueado' 
          AND (
            (? != '' AND (
              REPLACE(REPLACE(REPLACE(COALESCE(fono, ''), ' ', ''), '+', ''), '-', '') LIKE '%' || ? || '%'
              OR REPLACE(REPLACE(REPLACE(COALESCE(whatsapp, ''), ' ', ''), '+', ''), '-', '') LIKE '%' || ? || '%'
            ))
            OR (? != '' AND (
              REPLACE(REPLACE(REPLACE(COALESCE(fono, ''), ' ', ''), '+', ''), '-', '') LIKE '%' || ? || '%'
              OR REPLACE(REPLACE(REPLACE(COALESCE(whatsapp, ''), ' ', ''), '+', ''), '-', '') LIKE '%' || ? || '%'
            ))
          )
        LIMIT 1
      `).bind(
        sigDigitsFono, sigDigitsFono, sigDigitsFono,
        sigDigitsWa, sigDigitsWa, sigDigitsWa
      ).first();

      if (bloq) {
        return Response.json({
          error: `Este profesional (${bloq.nombre}) solicitó expresamente no figurar en el directorio y se encuentra bloqueado por privacidad.`
        }, { status: 400 });
      }
    }

    const id = body.id || ('c-' + Date.now().toString().slice(-6));
    const token = body.token_acceso || crypto.randomUUID();
    const sitioWeb = String(body.sitio_web || body.sitioWeb || '').trim();
    const certificaciones = String(body.certificaciones || '').trim();
    const recomendadoPorFinal = String(body.recomendadoPor || body.recomendado_por || '').trim();

    await env.DB.prepare(`
      INSERT INTO contactos (
        id, tipo, rubro, nombre, contacto, fono, whatsapp, email, region, ciudad,
        recomendado_por, rating, reviews, ultimo_proyecto, notas, token_acceso,
        estado_disponibilidad, fecha_ingreso, estado_publicacion, consentimiento_publicacion,
        sitio_web, certificaciones, creado_por, creador_ciudad, creador_wa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Por confirmar', date('now'), 'publicado', 1, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.tipo || '',
      body.rubro || '',
      body.nombre.trim(),
      body.contacto || '',
      body.fono || '',
      body.whatsapp || '',
      body.email || '',
      body.region || '',
      body.ciudad || '',
      recomendadoPorFinal,
      Number(body.rating) || 0,
      Number(body.reviews) || 0,
      body.ultimoProyecto || body.ultimo_proyecto || '',
      body.notas || '',
      token,
      sitioWeb,
      certificaciones,
      creadoPor,
      creadorCiudad,
      creadorWa
    ).run();

    return Response.json({
      ok: true,
      record: {
        id,
        _id: id,
        ...body,
        sitio_web: sitioWeb,
        certificaciones,
        token_acceso: token,
        creado_por: creadoPor,
        creador_ciudad: creadorCiudad,
        creador_wa: creadorWa
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error al guardar en D1", detail: error.message }, { status: 500 });
  }
}
