// functions/api/recomendar.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body.contactoId) return Response.json({ error: 'Falta contactoId' }, { status: 400 });
    if (!body.autor || !body.autor.trim()) return Response.json({ error: 'Tu nombre es obligatorio' }, { status: 400 });
    if (!body.comentario || !body.comentario.trim()) return Response.json({ error: 'El comentario es obligatorio' }, { status: 400 });

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const now = new Date();
    const fecha = `${meses[now.getMonth()]} ${now.getFullYear()}`;
    const id = 'rec-' + Date.now().toString().slice(-8);

    await env.DB.prepare(`
      INSERT INTO recomendaciones (id, contacto_id, autor, comentario, fecha)
      VALUES (?, ?, ?, ?, ?)
    `).bind(id, String(body.contactoId), String(body.autor).trim(), String(body.comentario).trim(), fecha).run();

    return Response.json({
      ok: true,
      record: {
        id,
        _id: id,
        contacto_id: String(body.contactoId),
        autor: String(body.autor).trim(),
        comentario: String(body.comentario).trim(),
        fecha
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error en D1 al guardar recomendación", detail: error.message }, { status: 500 });
  }
}
