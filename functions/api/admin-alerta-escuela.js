// functions/api/admin-alerta-escuela.js — Cloudflare Pages Function con D1
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

async function asegurarTablaAlerta(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS alerta_escuela (
      id TEXT PRIMARY KEY,
      activa INTEGER DEFAULT 0,
      fecha_alerta TEXT DEFAULT '',
      detalle TEXT DEFAULT '',
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const existe = await env.DB.prepare("SELECT id FROM alerta_escuela WHERE id = 'escuela_construccion'").first();
  if (!existe) {
    await env.DB.prepare("INSERT INTO alerta_escuela (id, activa, fecha_alerta, detalle) VALUES ('escuela_construccion', 0, '', '')").run();
  }
}

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    await asegurarTablaAlerta(env);

    const row = await env.DB.prepare("SELECT activa, fecha_alerta, detalle FROM alerta_escuela WHERE id = 'escuela_construccion'").first();
    return Response.json({
      ok: true,
      activa: row ? Boolean(row.activa) : false,
      fecha: row ? row.fecha_alerta : '',
      detalle: row ? row.detalle : ''
    }, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Error consultando alerta", detail: err.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    const adminPassword = env.ADMIN_PASSWORD || "jems2026";
    const auth = request.headers.get("Authorization") || "";
    const tokenEsperado = await crearAdminToken(adminPassword);

    await asegurarTablaAlerta(env);
    const body = await request.json().catch(() => ({}));
    const accion = String(body.accion || '').trim();

    // 1. Descartar alerta (marcar como vista)
    if (accion === 'descartar') {
      if (auth !== `Bearer ${tokenEsperado}`) {
        return Response.json({ error: "No autorizado" }, { status: 401 });
      }
      await env.DB.prepare("UPDATE alerta_escuela SET activa = 0 WHERE id = 'escuela_construccion'").run();
      return Response.json({ ok: true, mensaje: "Alerta descartada." });
    }

    // 2. Activar alerta (puede ser activada desde el sincronizador o webhook)
    if (accion === 'activar') {
      const ahoraIso = new Date().toISOString();
      const detalle = String(body.detalle || 'Nuevo mensaje detectado en el grupo').trim();
      await env.DB.prepare("UPDATE alerta_escuela SET activa = 1, fecha_alerta = ?, detalle = ? WHERE id = 'escuela_construccion'").bind(ahoraIso, detalle).run();
      return Response.json({ ok: true, mensaje: "Alerta activada." });
    }

    return Response.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: "Error gestionando alerta", detail: err.message }, { status: 500 });
  }
}
