// functions/api/registrar-visita.js — Cloudflare Pages Function con D1
export async function onRequestPost({ env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    // Auto-migración si no existe la tabla
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS registro_visitas (
        fecha TEXT PRIMARY KEY,
        total INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    await env.DB.prepare(`
      INSERT INTO registro_visitas (fecha, total)
      VALUES (?, 1)
      ON CONFLICT(fecha) DO UPDATE SET total = total + 1
    `).bind(hoy).run();

    return Response.json({ ok: true, fecha: hoy }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error registrando visita", detail: error.message }, { status: 500 });
  }
}
