// functions/api/login.js — Cloudflare Pages Function
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
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

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
  const appPassword = env.APP_PASSWORD || "miraflores";
  const adminPassword = env.ADMIN_PASSWORD || "jems2026";

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Solicitud inválida" },
      { status: 400 }
    );
  }

  const password = String(body?.password ?? "").trim();

  if (!password) {
    return Response.json(
      { error: "Falta la contraseña" },
      { status: 400 }
    );
  }

  // 1. Si ingresa la clave de administrador maestra
  if (password === adminPassword) {
    const tokenEsperado = await crearToken(appPassword);
    const adminToken = await crearAdminToken(adminPassword);
    return Response.json({
      ok: true,
      token: tokenEsperado,
      adminToken: adminToken,
      isAdmin: true
    }, { status: 200 });
  }

  // 2. Si ingresa la clave normal del grupo de titulados
  if (password === appPassword) {
    const tokenEsperado = await crearToken(appPassword);
    return Response.json({
      ok: true,
      token: tokenEsperado,
      isAdmin: false
    }, { status: 200 });
  }

  return Response.json(
    { error: "Contraseña incorrecta" },
    { status: 401 }
  );
}
