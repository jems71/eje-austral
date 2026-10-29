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

export async function onRequestPost({ request, env }) {
  const appPassword = env.APP_PASSWORD || "miraflores";

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

  const tokenEsperado = await crearToken(appPassword);

  if (password !== appPassword) {
    return Response.json(
      { error: "Contraseña incorrecta" },
      { status: 401 }
    );
  }

  return Response.json({
    ok: true,
    token: tokenEsperado
  });
}
