// functions/api/eliminar-oferta.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || '').trim();

    if (!id) {
      return Response.json({ error: "El id de la oferta es obligatorio" }, { status: 400 });
    }

    await env.DB.prepare("DELETE FROM ofertas WHERE id = ?").bind(id).run();

    return Response.json({ ok: true, id }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error al eliminar oferta en D1", detail: error.message }, { status: 500 });
  }
}
