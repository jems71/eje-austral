// functions/api/registrar-clic.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const empresaNombre = (body.empresa || 'Empresa Desconocida').trim();
    const idEmpresa = (body.id_empresa || 'N/A').trim();

    if (idEmpresa === 'N/A') {
      return Response.json({ error: "id_empresa es requerido" }, { status: 400 });
    }

    // Operación atómica en SQLite D1: inserta o suma +1 si ya existe
    const stmt = env.DB.prepare(`
      INSERT INTO empresas (id_empresa, empresa, fecha_inicio, total_clics, ultimo_clic)
      VALUES (?, ?, date('now'), 1, datetime('now'))
      ON CONFLICT(id_empresa) DO UPDATE SET
        total_clics = total_clics + 1,
        ultimo_clic = datetime('now')
      RETURNING total_clics, fecha_inicio, ultimo_clic
    `);

    const result = await stmt.bind(idEmpresa, empresaNombre).first();

    return Response.json({
      success: true,
      empresa: empresaNombre,
      id_empresa: idEmpresa,
      total_clics: result ? result.total_clics : 1,
      fecha_inicio: result ? result.fecha_inicio : null,
      ultimo_clic: result ? result.ultimo_clic : null
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error en D1 al registrar clic", detail: error.message }, { status: 500 });
  }
}
