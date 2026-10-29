// functions/api/registrar-clic-contacto.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const contactoId = String(body.contactoId || '').trim();

    if (!contactoId) {
      return Response.json({ error: "contactoId es obligatorio" }, { status: 400 });
    }

    // Auto-migración
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS registro_clics_contacto (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contacto_id TEXT NOT NULL,
          fecha TEXT NOT NULL,
          hora TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_clics_contacto ON registro_clics_contacto(contacto_id)`).run();
      await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_clics_fecha ON registro_clics_contacto(fecha)`).run();
    } catch(e) {}

    try {
      await env.DB.prepare("ALTER TABLE contactos ADD COLUMN total_clics INTEGER DEFAULT 0").run();
    } catch(e) {}

    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10);
    const hora = ahora.toTimeString().slice(0, 8);

    // Actualización atómica en contactos y registro del evento
    await Promise.all([
      env.DB.prepare("UPDATE contactos SET total_clics = COALESCE(total_clics, 0) + 1 WHERE id = ?").bind(contactoId).run(),
      env.DB.prepare("INSERT INTO registro_clics_contacto (contacto_id, fecha, hora) VALUES (?, ?, ?)").bind(contactoId, fecha, hora).run()
    ]);

    return Response.json({ ok: true, contactoId }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error registrando clic de contacto", detail: error.message }, { status: 500 });
  }
}
