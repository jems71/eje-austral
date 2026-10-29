// functions/api/eliminar-oferta.js — Cloudflare Pages Function con D1
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
      return Response.json({ error: "No autorizado. Solo el administrador puede eliminar ofertas." }, { status: 401 });
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
