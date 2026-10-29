// functions/api/despacho-fichas.js — Cloudflare Pages Function con D1
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

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const appPassword = env.APP_PASSWORD || "miraflores";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearToken(appPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    try {
      await env.DB.prepare("ALTER TABLE contactos ADD COLUMN fecha_envio_link TEXT").run();
    } catch(e) {}

    try {
      await env.DB.prepare(`
        UPDATE contactos 
        SET estado_disponibilidad = 'Por confirmar' 
        WHERE tipo IN ('Subcontrato', 'Mano de obra', 'Profesional') 
          AND fecha_ultima_actualizacion_estado IS NULL
      `).run();
    } catch(e) {}

    const res = await env.DB.prepare(`
      SELECT id, nombre, tipo, rubro, ciudad, fono, whatsapp, token_acceso,
             CASE 
               WHEN fecha_ultima_actualizacion_estado IS NULL THEN 'Por confirmar'
               ELSE COALESCE(estado_disponibilidad, 'Por confirmar')
             END as estado_disponibilidad,
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
