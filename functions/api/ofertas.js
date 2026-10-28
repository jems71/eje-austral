
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

function fechaValida(fecha) {
  if (!fecha) return null;

  // Formato almacenado: DD/MM/YYYY HH:mm
  const match = String(fecha).match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?$/
  );

  if (!match) return null;

  const [, dia, mes, anio, hora = "00", minuto = "00"] = match;

  const date = new Date(
    Number(anio),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto)
  );

  if (
    date.getFullYear() !== Number(anio) ||
    date.getMonth() !== Number(mes) - 1 ||
    date.getDate() !== Number(dia)
  ) {
    return null;
  }

  return date;
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
    return Response.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const resultado = await env.DB.prepare(`
      SELECT id, texto, fecha_publicacion, publicado_por, estado
      FROM ofertas
      WHERE estado = 'publicada'
    `).all();

    const ahora = new Date();
    const limite = new Date(ahora.getTime() - 15 * 24 * 60 * 60 * 1000);

    const ofertas = resultado.results
      .filter(oferta => {
        const fecha = fechaValida(oferta.fecha_publicacion);
        return fecha && fecha >= limite && fecha <= ahora;
      })
      .sort((a, b) => {
        return fechaValida(b.fecha_publicacion) -
               fechaValida(a.fecha_publicacion);
      });

    return Response.json({ ok: true, ofertas });
  } catch (error) {
    console.error("Error consultando ofertas:", error);

    return Response.json(
      { error: "Error al consultar las ofertas" },
      { status: 500 }
    );
  }
}
