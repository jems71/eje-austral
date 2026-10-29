// functions/api/despacho-fichas.js — Cloudflare Pages Function con D1
export async function onRequestGet({ env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    try {
      await env.DB.prepare("ALTER TABLE contactos ADD COLUMN fecha_envio_link TEXT").run();
    } catch(e) {}

    const res = await env.DB.prepare(`
      SELECT id, nombre, tipo, rubro, ciudad, fono, whatsapp, token_acceso,
             COALESCE(estado_disponibilidad, 'Disponible') as estado_disponibilidad,
             COALESCE(estado_publicacion, 'publicado') as estado_publicacion,
             COALESCE(link_enviado, 0) as link_enviado,
             fecha_envio_link,
             fecha_ultima_actualizacion_estado
      FROM contactos
      WHERE tipo IN ('Subcontrato', 'Mano de obra', 'Profesional')
      ORDER BY link_enviado ASC, nombre ASC
    `).all();

    return Response.json({
      ok: true,
      contactos: res.results || []
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error consultando despacho de fichas", detail: error.message }, { status: 500 });
  }
}
