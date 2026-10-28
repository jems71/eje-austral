
export async function onRequestGet({ request, env }) {
  const auth = request.headers.get("Authorization") || "";

  if (!env.APP_PASSWORD || !env.DB) {
    return Response.json(
      { error: "Falta configurar APP_PASSWORD o la conexión D1" },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.APP_PASSWORD),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const firma = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode("grupo-uach-session")
  );

  const tokenEsperado = Array.from(new Uint8Array(firma))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");

  if (auth !== `Bearer ${tokenEsperado}`) {
    return Response.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const contactos = await env.DB.prepare(`
      SELECT * FROM contactos
      WHERE estado_publicacion = 'publicado'
        AND consentimiento_publicacion = 1
    `).all();

    const recomendaciones = await env.DB.prepare(
      "SELECT * FROM recomendaciones"
    ).all();

    const ofertas = await env.DB.prepare(`
      SELECT * FROM ofertas
      WHERE estado = 'publicada'
      ORDER BY id DESC
    `).all();

    return Response.json({
      contactos: contactos.results,
      recomendaciones: recomendaciones.results,
      ofertas: ofertas.results,
      _errors: [],
      _counts: {
        contactos: contactos.results.length,
        recomendaciones: recomendaciones.results.length,
        ofertas: ofertas.results.length
      }
    });
  } catch (error) {
    return Response.json(
      { error: "Error al consultar la base de datos" },
      { status: 500 }
    );
  }
}
