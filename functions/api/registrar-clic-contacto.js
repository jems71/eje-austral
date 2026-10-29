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

    // Fecha y hora oficial de Chile (America/Santiago)
    const ahora = new Date();
    const formatoChile = new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(ahora);

    const getPart = type => (formatoChile.find(p => p.type === type)?.value || '');
    const fecha = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    const hora = `${getPart('hour')}:${getPart('minute')}:${getPart('second')}`;

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
