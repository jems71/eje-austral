// functions/api/estadisticas.js — Cloudflare Pages Function con D1
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
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    // Auto-migración por si es la primera llamada
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS registro_visitas (
          fecha TEXT PRIMARY KEY,
          total INTEGER DEFAULT 1,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `).run();
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS registro_clics_contacto (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          contacto_id TEXT NOT NULL,
          fecha TEXT NOT NULL,
          hora TEXT NOT NULL,
          created_at TEXT DEFAULT (datetime('now'))
        )
      `).run();
      await env.DB.prepare("ALTER TABLE contactos ADD COLUMN total_clics INTEGER DEFAULT 0").run();
    } catch(e) {}

    const hoy = new Date().toISOString().slice(0, 10);

    const [visitasTotalRes, visitasHoyRes, clicsTotalRes, rankingRes, ultimosClicsRes] = await Promise.all([
      env.DB.prepare("SELECT COALESCE(SUM(total), 0) as total FROM registro_visitas").first(),
      env.DB.prepare("SELECT COALESCE(total, 0) as hoy FROM registro_visitas WHERE fecha = ?").bind(hoy).first(),
      env.DB.prepare("SELECT COALESCE(SUM(total_clics), 0) as total FROM contactos").first(),
      env.DB.prepare(`
        SELECT c.id, c.nombre, c.rubro, c.ciudad, c.tipo, COALESCE(c.total_clics, 0) as total_clics,
               (
                 SELECT r.fecha || ' ' || r.hora 
                 FROM registro_clics_contacto r 
                 WHERE r.contacto_id = c.id 
                 ORDER BY r.id DESC 
                 LIMIT 1
               ) as ultimo_clic
        FROM contactos c
        ORDER BY c.total_clics DESC, c.nombre ASC
      `).all(),
      env.DB.prepare(`
        SELECT r.id, r.contacto_id, r.fecha, r.hora, c.nombre, c.rubro
        FROM registro_clics_contacto r
        LEFT JOIN contactos c ON r.contacto_id = c.id
        ORDER BY r.id DESC
        LIMIT 15
      `).all()
    ]);

    const ranking = (rankingRes.results || []).map((c, i) => ({
      posicion: i + 1,
      id: c.id,
      nombre: c.nombre || 'Sin nombre',
      rubro: c.rubro || 'General',
      ciudad: c.ciudad || 'No especificada',
      tipo: c.tipo || 'Profesional',
      total_clics: Number(c.total_clics) || 0,
      ultimo_clic: c.ultimo_clic || null
    }));

    const topContactado = ranking.find(c => c.total_clics > 0) || null;

    return Response.json({
      ok: true,
      stats: {
        total_visitas: visitasTotalRes ? Number(visitasTotalRes.total) : 0,
        visitas_hoy: visitasHoyRes ? Number(visitasHoyRes.hoy) : 0,
        total_clics: clicsTotalRes ? Number(clicsTotalRes.total) : 0,
        top_profesional: topContactado ? { nombre: topContactado.nombre, rubro: topContactado.rubro, clics: topContactado.total_clics } : null,
        ranking,
        ultimos_clics: ultimosClicsRes.results || []
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error consultando estadísticas", detail: error.message }, { status: 500 });
  }
}
