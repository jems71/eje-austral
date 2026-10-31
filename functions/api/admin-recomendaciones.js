// functions/api/admin-recomendaciones.js — Cloudflare Pages Function con D1
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

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearAdminToken(adminPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const res = await env.DB.prepare(`
      SELECT r.id, r.contacto_id, r.autor, r.cargo_autor, r.fono_autor, r.proyecto, r.comentario, r.fecha, r.created_at,
             c.nombre AS contacto_nombre, c.rubro AS contacto_rubro, c.whatsapp AS contacto_whatsapp, c.fono AS contacto_fono
      FROM recomendaciones r
      LEFT JOIN contactos c ON r.contacto_id = c.id
      WHERE r.estado = 'pendiente'
      ORDER BY r.created_at DESC
    `).all();

    return Response.json({
      ok: true,
      pendientes: res.results || []
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error consultando recomendaciones pendientes", detail: error.message }, { status: 500 });
  }
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
      return Response.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || '').trim();
    const accion = String(body.accion || '').trim(); // 'aprobar' | 'rechazar'

    if (!id || !['aprobar', 'rechazar'].includes(accion)) {
      return Response.json({ error: "ID y acción ('aprobar' o 'rechazar') son obligatorios" }, { status: 400 });
    }

    if (accion === 'aprobar') {
      await env.DB.prepare(`
        UPDATE recomendaciones
        SET estado = 'aprobada'
        WHERE id = ?
      `).bind(id).run();

      // Recalcular contador de reviews en contactos
      await env.DB.prepare(`
        UPDATE contactos
        SET reviews = (
          SELECT COUNT(*) FROM recomendaciones 
          WHERE contacto_id = contactos.id AND (estado = 'aprobada' OR estado IS NULL)
        )
        WHERE id = (SELECT contacto_id FROM recomendaciones WHERE id = ?)
      `).bind(id).run();

      return Response.json({ ok: true, accion: 'aprobada', id }, { status: 200 });
    } else {
      await env.DB.prepare(`
        UPDATE recomendaciones
        SET estado = 'rechazada'
        WHERE id = ?
      `).bind(id).run();

      return Response.json({ ok: true, accion: 'rechazada', id }, { status: 200 });
    }

  } catch (error) {
    return Response.json({ error: "Error procesando recomendación", detail: error.message }, { status: 500 });
  }
}
