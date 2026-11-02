// functions/api/registrar-visita.js — Cloudflare Pages Function con D1
function fechaChile() {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago' }).format(new Date());
  } catch (e) {
    return new Date().toISOString().slice(0, 10);
  }
}

function horaChile() {
  try {
    return new Intl.DateTimeFormat('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().slice(11, 19);
  }
}

function fechaHoraChileCompacto() {
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
        const ahoraStr = fechaHoraChileCompacto();
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

    // 2. Registro general diario de visitas y log detallado
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS registro_visitas (
        fecha TEXT PRIMARY KEY,
        total INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS registro_visitas_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        hora TEXT NOT NULL,
        dispositivo TEXT NOT NULL,
        ciudad TEXT DEFAULT '',
        colega_id INTEGER DEFAULT 0,
        es_app INTEGER DEFAULT 0,
        navegador TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    const hoy = fechaChile();
    const hora = horaChile();

    // Detección de dispositivo y navegador
    const ua = request.headers.get("user-agent") || "";
    let dispositivo = body?.dispositivo || "🖥️ Computador (PC)";
    if (/whatsapp/i.test(ua)) {
      dispositivo = "📱 WhatsApp (Móvil)";
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      dispositivo = "📱 iPhone (iOS)";
    } else if (/android/i.test(ua)) {
      dispositivo = "📱 Teléfono (Android)";
    } else if (/mobile/i.test(ua)) {
      dispositivo = "📱 Dispositivo Móvil";
    }

    let navegador = "Web";
    if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) navegador = "Chrome";
    else if (/edg/i.test(ua)) navegador = "Edge";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) navegador = "Safari";
    else if (/firefox/i.test(ua)) navegador = "Firefox";

    const ciudad = request.headers.get("cf-ipcity") || request.headers.get("cf-region") || "Chile";

    // Actualizar acumulado por fecha
    await env.DB.prepare(`
      INSERT INTO registro_visitas (fecha, total)
      VALUES (?, 1)
      ON CONFLICT(fecha) DO UPDATE SET total = total + 1
    `).bind(hoy).run();

    // Insertar en log detallado con día y hora
    await env.DB.prepare(`
      INSERT INTO registro_visitas_log (fecha, hora, dispositivo, ciudad, colega_id, es_app, navegador)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(hoy, hora, dispositivo, ciudad, colegaId, esAppInstalada, navegador).run();

    return Response.json({ ok: true, fecha: hoy, hora, colegaId: colegaId || null }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error registrando visita", detail: error.message }, { status: 500 });
  }
}
