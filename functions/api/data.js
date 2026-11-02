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

function crearAdminToken(password) {
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
      new TextEncoder().encode("grupo-uach-admin-session")
    );
    return Array.from(new Uint8Array(firma))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  });
}

export async function onRequestGet({ request, env }) {
  const appPassword = env.APP_PASSWORD || "miraflores";
  const adminPassword = env.ADMIN_PASSWORD || "jems2026";
  if (!env.DB) {
    return Response.json(
      { error: "Falta configurar la conexión D1" },
      { status: 500 }
    );
  }

  const auth = request.headers.get("Authorization") || "";
  const tokenEsperado = await crearToken(appPassword);
  const adminTokenEsperado = await crearAdminToken(adminPassword);

  if (auth !== `Bearer ${tokenEsperado}` && auth !== `Bearer ${adminTokenEsperado}`) {
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
        SELECT id, autor, cargo_autor, fono_autor, contacto_id, comentario, proyecto, fecha
        FROM recomendaciones
        WHERE (estado IS NULL OR estado = 'aprobada')
      `).all(),

      env.DB.prepare(`
        SELECT id, texto, fecha_publicacion, publicado_por
        FROM ofertas
        WHERE (estado IS NULL OR estado = 'publicada')
        ORDER BY fecha_publicacion DESC
      `).all()
    ]);

    const contactos = (contactosResult.results || []).map(c => {
      const { verificado, consentimiento_publicacion, estado_publicacion, notas_admin, notas_privadas, ...publico } = c;
      return {
        ...publico,
        ciudad: c.ciudad || '',
        recomendadoPor: c.recomendado_por || '',
        ultimoProyecto: c.ultimo_proyecto || '',
        sitio_web: c.sitio_web || '',
        certificaciones: c.certificaciones || ''
      };
    });

    return Response.json({
      contactos,
      recomendaciones: recomendacionesResult.results || [],
      ofertas: ofertasResult.results || []
    }, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=30"
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
