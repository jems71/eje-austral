// functions/api/admin-login.js — Cloudflare Pages Function
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
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function onRequestPost({ request, env }) {
  try {
    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const body = await request.json().catch(() => ({}));
    const password = String(body.password || '').trim();

    if (!password) {
      return Response.json({ error: "Falta la clave de administrador" }, { status: 400 });
    }

    if (password !== adminPassword) {
      return Response.json({ error: "Clave de administrador incorrecta" }, { status: 401 });
    }

    const token = await crearAdminToken(adminPassword);
    return Response.json({ ok: true, token }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error al verificar clave de administrador", detail: error.message }, { status: 500 });
  }
}
