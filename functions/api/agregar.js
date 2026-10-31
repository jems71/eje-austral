// functions/api/agregar.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body || !body.nombre || !body.nombre.trim()) {
      return Response.json({ error: 'El campo "nombre" es obligatorio' }, { status: 400 });
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

    await env.DB.prepare(`
      INSERT INTO contactos (
        id, tipo, rubro, nombre, contacto, fono, whatsapp, email, region, ciudad,
        recomendado_por, rating, reviews, ultimo_proyecto, notas, token_acceso,
        estado_disponibilidad, fecha_ingreso, estado_publicacion, consentimiento_publicacion,
        sitio_web, certificaciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Por confirmar', date('now'), 'publicado', 1, ?, ?)
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
      body.recomendadoPor || body.recomendado_por || '',
      Number(body.rating) || 0,
      Number(body.reviews) || 0,
      body.ultimoProyecto || body.ultimo_proyecto || '',
      body.notas || '',
      token,
      sitioWeb,
      certificaciones
    ).run();

    return Response.json({ ok: true, record: { id, _id: id, ...body, sitio_web: sitioWeb, certificaciones, token_acceso: token } }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error al guardar en D1", detail: error.message }, { status: 500 });
  }
}
