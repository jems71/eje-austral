// functions/api/admin-editar-contacto.js — Cloudflare Pages Function con D1
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

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const appPassword = env.APP_PASSWORD || "miraflores";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearToken(appPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado. Solo el administrador puede editar contactos." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || '').trim();
    if (!id) {
      return Response.json({ error: "El ID del contacto es obligatorio" }, { status: 400 });
    }

    const nombre = String(body.nombre || '').trim();
    if (!nombre) {
      return Response.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    const tipo = String(body.tipo || '').trim();
    const rubro = String(body.rubro || '').trim();
    const ciudad = String(body.ciudad || '').trim();
    const region = String(body.region || '').trim();
    const contacto = String(body.contacto || '').trim();
    const fono = String(body.fono || '').trim();
    const whatsapp = String(body.whatsapp || '').trim();
    const email = String(body.email || '').trim();
    const ultimoProyecto = String(body.ultimoProyecto || body.ultimo_proyecto || '').trim();
    const estadoDisp = String(body.estado_disponibilidad || '').trim();

    const res = await env.DB.prepare(`
      UPDATE contactos
      SET nombre = ?,
          tipo = ?,
          rubro = ?,
          ciudad = ?,
          region = CASE WHEN ? != '' THEN ? ELSE region END,
          contacto = ?,
          fono = ?,
          whatsapp = ?,
          email = ?,
          ultimo_proyecto = CASE WHEN ? != '' THEN ? ELSE ultimo_proyecto END,
          estado_disponibilidad = CASE WHEN ? != '' THEN ? ELSE estado_disponibilidad END
      WHERE id = ?
    `).bind(
      nombre,
      tipo,
      rubro,
      ciudad,
      region, region,
      contacto,
      fono,
      whatsapp,
      email,
      ultimoProyecto, ultimoProyecto,
      estadoDisp, estadoDisp,
      id
    ).run();

    if (res.meta && res.meta.changes === 0) {
      return Response.json({ error: "Contacto no encontrado en la base de datos" }, { status: 404 });
    }

    const actualizado = await env.DB.prepare("SELECT * FROM contactos WHERE id = ?").bind(id).first();

    return Response.json({
      ok: true,
      id,
      contacto: actualizado
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error al actualizar contacto en D1", detail: error.message }, { status: 500 });
  }
}
