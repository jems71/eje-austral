// functions/api/busqueda-ofertas.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS metricas_ofertas (
          clave TEXT PRIMARY KEY,
          valor INTEGER DEFAULT 0
        )
      `).run();
      await env.DB.prepare(`
        INSERT OR IGNORE INTO metricas_ofertas (clave, valor) VALUES ('total_busquedas', 28)
      `).run();
    } catch(e) {}

    await env.DB.prepare(`
      UPDATE metricas_ofertas
      SET valor = valor + 1
      WHERE clave = 'total_busquedas'
    `).run();

    const m = await env.DB.prepare("SELECT valor FROM metricas_ofertas WHERE clave = 'total_busquedas'").first();
    const total = m ? Number(m.valor) : 1;

    return Response.json({ ok: true, total_busquedas: total });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function onRequestGet({ env }) {
  try {
    if (!env.DB) return Response.json({ total_busquedas: 28 });
    const m = await env.DB.prepare("SELECT valor FROM metricas_ofertas WHERE clave = 'total_busquedas'").first();
    return Response.json({ ok: true, total_busquedas: m ? Number(m.valor) : 28 });
  } catch (error) {
    return Response.json({ total_busquedas: 28 });
  }
}
