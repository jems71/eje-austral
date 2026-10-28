
function crearToken(password) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ).then(async key => {
    const firma = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode("grupo-uach-session")
    );
    return Array.from(new Uint8Array(firma))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.APP_PASSWORD || !env.DB) {
    return Response.json(
      { error: "Falta configurar APP_PASSWORD o la conexión D1" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("Authorization") || "";
  const tokenEsperado = await crearToken(env.APP_PASSWORD);

  if (auth !== `Bearer ${tokenEsperado}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [contactosResult, recomendacionesResult] = await Promise.all([
      env.DB.prepare(`
        SELECT *
        FROM contactos
        WHERE estado_publicacion = 'publicado'
          AND consentimiento_publicacion = 1
      `).all(),

      env.DB.prepare(`
        SELECT id, autor, contacto_id, comentario, proyecto, fecha
        FROM recomendaciones
      `).all()
    ]);

    const contactos = contactosResult.results.map(c => ({
      ...c,
      recomendadoPor: c.recomendado_por || "",
      ultimoProyecto: c.ultimo_proyecto || "",
      fecha_ingreso: c.fecha_ingreso || ""
    }));

    const recomendaciones = recomendacionesResult.results.map(r => ({
      ...r,
      contactoId: r.contacto_id
    }));

    return Response.json({
      contactos,
      recomendaciones,
      _errors: [],
      _counts: {
        contactos: contactos.length,
        recomendaciones: recomendaciones.length
      }
    });
  } catch (error) {
    console.error("Error consultando D1:", error);
    return Response.json(
      { error: "Error al consultar la base de datos" },
      { status: 500 }
    );
  }
}
