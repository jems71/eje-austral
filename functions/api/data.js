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
  const appPassword = env.APP_PASSWORD || "miraflores";
  if (!env.DB) {
    return Response.json(
      { error: "Falta configurar la conexión D1" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("Authorization") || "";
  const tokenEsperado = await crearToken(appPassword);

  if (auth !== `Bearer ${tokenEsperado}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const [contactosResult, recomendacionesResult, ofertasResult] = await Promise.all([
      env.DB.prepare(`
        SELECT *
        FROM contactos
        WHERE (estado_publicacion IS NULL OR estado_publicacion = 'publicado')
          AND (consentimiento_publicacion IS NULL OR consentimiento_publicacion = 1)
        ORDER BY nombre ASC
      `).all(),

      env.DB.prepare(`
        SELECT id, autor, contacto_id, comentario, proyecto, fecha
        FROM recomendaciones
      `).all(),

      env.DB.prepare(`
        SELECT id, texto, publicado_por, fecha_publicacion, estado
        FROM ofertas
        WHERE (estado IS NULL OR estado = 'publicada')
        ORDER BY fecha_publicacion DESC
      `).all()
    ]);

    const contactos = contactosResult.results.map(c => ({
      ...c,
      recomendadoPor: c.recomendadoPor || c.recomendado_por || "",
      ultimoProyecto: c.ultimoProyecto || c.ultimo_proyecto || "",
      fecha_ingreso: c.fecha_ingreso || "",
      estado_disponibilidad: (['Subcontrato', 'Mano de obra', 'Profesional'].includes(c.tipo) && !c.fecha_ultima_actualizacion_estado)
        ? 'Por confirmar'
        : (c.estado_disponibilidad || 'Por confirmar')
    }));

    const recomendaciones = recomendacionesResult.results.map(r => ({
      ...r,
      contactoId: r.contacto_id || r.contactoId
    }));

    const ofertas = ofertasResult.results || [];

    return Response.json({
      contactos,
      recomendaciones,
      ofertas,
      _errors: [],
      _counts: {
        contactos: contactos.length,
        recomendaciones: recomendaciones.length,
        ofertas: ofertas.length
      }
    });
  } catch (error) {
    console.error("Error consultando D1:", error);
    return Response.json(
      { error: "Error al consultar la base de datos", detail: error.message },
      { status: 500 }
    );
  }
}
