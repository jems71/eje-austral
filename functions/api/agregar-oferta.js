// functions/api/agregar-oferta.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body || !body.texto || !body.texto.trim()) {
      return Response.json({ error: 'El campo "texto" es obligatorio' }, { status: 400 });
    }

    const id = 'of-' + Date.now().toString().slice(-8);
    const ahora = new Date().toISOString();
    const texto = body.texto.trim();
    const publicadoPor = (body.publicado_por || 'Admin').trim();

    await env.DB.prepare(`
      INSERT INTO ofertas (id, texto, publicado_por, fecha_publicacion, estado)
      VALUES (?, ?, ?, ?, 'publicada')
    `).bind(id, texto, publicadoPor, ahora).run();

    return Response.json({
      ok: true,
      record: { id, texto, publicado_por: publicadoPor, fecha_publicacion: ahora, estado: 'publicada' }
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error en D1 al agregar oferta", detail: error.message }, { status: 500 });
  }
}
