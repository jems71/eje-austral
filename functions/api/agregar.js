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

    const id = body.id || ('c-' + Date.now().toString().slice(-6));
    const token = body.token_acceso || crypto.randomUUID();

    await env.DB.prepare(`
      INSERT INTO contactos (
        id, tipo, rubro, nombre, contacto, fono, whatsapp, email, region, ciudad,
        recomendado_por, rating, reviews, ultimo_proyecto, notas, token_acceso,
        estado_disponibilidad, fecha_ingreso, estado_publicacion, consentimiento_publicacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Disponible', date('now'), 'publicado', 1)
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
      token
    ).run();

    return Response.json({ ok: true, record: { id, _id: id, ...body, token_acceso: token } }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error al guardar en D1", detail: error.message }, { status: 500 });
  }
}
