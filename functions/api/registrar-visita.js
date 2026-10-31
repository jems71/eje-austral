// functions/api/registrar-visita.js — Cloudflare Pages Function con D1
function fechaHoraChile() {
  try {
    const partes = new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const get = (t) => (partes.find(p => p.type === t)?.value || '');
    return `${get('day')}-${get('month')} ${get('hour')}:${get('minute')}`;
  } catch (e) {
    return new Date().toISOString().slice(5, 16).replace('T', ' ');
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    let body = {};
    try {
      body = await request.json();
    } catch (e) {}

    const colegaId = Number(body?.colegaId || 0);
    const esAppInstalada = body?.esAppInstalada ? 1 : 0;
    const soloMarcarInstalada = Boolean(body?.soloMarcarInstalada);

    // 1. Si viene identificado un colega del grupo (?c=ID), registrar su ingreso en colegas_grupo
    if (colegaId > 0) {
      try {
        const ahoraStr = fechaHoraChile();
        if (soloMarcarInstalada) {
          await env.DB.prepare(`
            UPDATE colegas_grupo
            SET uso_app_instalada = 1,
                ultimo_ingreso = CASE WHEN ultimo_ingreso IS NULL OR ultimo_ingreso = '' THEN ? ELSE ultimo_ingreso END
            WHERE id = ?
          `).bind(ahoraStr, colegaId).run();
          return Response.json({ ok: true, colegaId, instalada: true }, { status: 200 });
        } else {
          await env.DB.prepare(`
            UPDATE colegas_grupo
            SET visitas = COALESCE(visitas, 0) + 1,
                primer_ingreso = CASE WHEN primer_ingreso IS NULL OR primer_ingreso = '' THEN ? ELSE primer_ingreso END,
                ultimo_ingreso = ?,
                uso_app_instalada = CASE WHEN ? = 1 THEN 1 ELSE COALESCE(uso_app_instalada, 0) END
            WHERE id = ?
          `).bind(ahoraStr, ahoraStr, esAppInstalada, colegaId).run();
        }
      } catch (e) {
        console.error("Error actualizando visita de colega:", e);
      }
    }

    // 2. Registro general diario de visitas
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

    return Response.json({ ok: true, fecha: hoy, colegaId: colegaId || null }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error registrando visita", detail: error.message }, { status: 500 });
  }
}
