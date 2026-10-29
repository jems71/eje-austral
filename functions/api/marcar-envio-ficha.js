// functions/api/marcar-envio-ficha.js — Cloudflare Pages Function con D1
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

    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearAdminToken(adminPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || '').trim();

    if (!id) {
      return Response.json({ error: "El id del contacto es obligatorio" }, { status: 400 });
    }

    try {
      await env.DB.prepare("ALTER TABLE contactos ADD COLUMN fecha_envio_link TEXT").run();
    } catch(e) {}

    const hoy = new Date().toISOString().slice(0, 10);

    await env.DB.prepare(`
      UPDATE contactos
      SET link_enviado = 1, fecha_envio_link = ?
      WHERE id = ?
    `).bind(hoy, id).run();

    return Response.json({ ok: true, id, fecha_envio_link: hoy }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error marcando envío de ficha", detail: error.message }, { status: 500 });
  }
}
