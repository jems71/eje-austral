// functions/api/admin-pymes.js — Cloudflare Pages Function con D1
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

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearAdminToken(adminPassword);

    if (auth !== `Bearer ${tokenEsperado}`) {
      return Response.json({ error: "No autorizado. Solo el administrador puede gestionar pymes." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const accion = String(body.accion || '').trim();
    const id = String(body.id || '').trim();

    if (!id) {
      return Response.json({ error: "Falta el ID de la pyme" }, { status: 400 });
    }

    if (accion === 'eliminar') {
      await env.DB.prepare("DELETE FROM pymes_colegas WHERE id = ?").bind(id).run();
      return Response.json({ ok: true, mensaje: "Pyme eliminada correctamente." });
    }

    if (accion === 'pausar') {
      await env.DB.prepare("UPDATE pymes_colegas SET estado = 'pausada' WHERE id = ?").bind(id).run();
      return Response.json({ ok: true, mensaje: "Pyme pausada." });
    }

    if (accion === 'activar') {
      await env.DB.prepare("UPDATE pymes_colegas SET estado = 'publicada' WHERE id = ?").bind(id).run();
      return Response.json({ ok: true, mensaje: "Pyme activada y visible." });
    }

    if (accion === 'editar') {
      await env.DB.prepare(`
        UPDATE pymes_colegas
        SET nombre_empresa = ?, nombre_titulado = ?, ano_titulacion = ?,
            rubro = ?, ciudad = ?, cobertura = ?, telefono = ?,
            whatsapp = ?, email = ?, sitio_web = ?, instagram = ?, facebook = ?,
            descripcion = ?, servicios_detalle = ?, estado = ?
        WHERE id = ?
      `).bind(
        String(body.nombre_empresa || '').trim(),
        String(body.nombre_titulado || '').trim(),
        String(body.ano_titulacion || '').trim(),
        String(body.rubro || '').trim(),
        String(body.ciudad || '').trim(),
        String(body.cobertura || '').trim(),
        String(body.telefono || '').trim(),
        String(body.whatsapp || '').trim(),
        String(body.email || '').trim(),
        String(body.sitio_web || '').trim(),
        String(body.instagram || '').trim(),
        String(body.facebook || '').trim(),
        String(body.descripcion || '').trim(),
        String(body.servicios_detalle || '').trim(),
        String(body.estado || 'publicada').trim(),
        id
      ).run();
      return Response.json({ ok: true, mensaje: "Pyme actualizada correctamente." });
    }

    return Response.json({ error: "Acción no reconocida" }, { status: 400 });

  } catch (error) {
    return Response.json({ error: "Error en gestión de pymes", detail: error.message }, { status: 500 });
  }
}
