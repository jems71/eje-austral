// functions/api/pymes.js — Cloudflare Pages Function con D1
function crearToken(password) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ).then(async key => {
    const firma = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode("grupo-uach-session")
    );
    return Array.from(new Uint8Array(firma))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  });
}

function crearAdminToken(password) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  ).then(async key => {
    const firma = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode("grupo-uach-admin-session")
    );
    return Array.from(new Uint8Array(firma))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  });
}

async function verificarAuth(request, env) {
  const appPassword = env.APP_PASSWORD || "miraflores";
  const adminPassword = env.ADMIN_PASSWORD || "jems2026";
  const auth = request.headers.get("Authorization") || "";
  const tokenEsperado = await crearToken(appPassword);
  const adminTokenEsperado = await crearAdminToken(adminPassword);

  if (auth === `Bearer ${tokenEsperado}` || auth === `Bearer ${adminTokenEsperado}`) {
    return true;
  }
  return false;
}

async function asegurarTablaPymes(env) {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS pymes_colegas (
      id TEXT PRIMARY KEY,
      nombre_empresa TEXT NOT NULL,
      nombre_titulado TEXT NOT NULL,
      ano_titulacion TEXT DEFAULT '',
      rubro TEXT NOT NULL,
      ciudad TEXT NOT NULL,
      cobertura TEXT DEFAULT '',
      telefono TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      email TEXT DEFAULT '',
      sitio_web TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      facebook TEXT DEFAULT '',
      descripcion TEXT NOT NULL,
      servicios_detalle TEXT DEFAULT '',
      estado TEXT DEFAULT 'publicada',
      fecha_registro TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  try { await env.DB.prepare("ALTER TABLE pymes_colegas ADD COLUMN instagram TEXT DEFAULT ''").run(); } catch(e) {}
  try { await env.DB.prepare("ALTER TABLE pymes_colegas ADD COLUMN facebook TEXT DEFAULT ''").run(); } catch(e) {}
}

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const autorizada = await verificarAuth(request, env);
    if (!autorizada) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    await asegurarTablaPymes(env);

    const res = await env.DB.prepare(`
      SELECT id, nombre_empresa, nombre_titulado, ano_titulacion, rubro, ciudad,
             cobertura, telefono, whatsapp, email, sitio_web, instagram, facebook,
             descripcion, servicios_detalle, estado, fecha_registro
      FROM pymes_colegas
      WHERE (estado IS NULL OR estado = 'publicada')
      ORDER BY fecha_registro DESC, nombre_empresa ASC
    `).all();

    return Response.json({
      ok: true,
      pymes: res.results || []
    }, {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (error) {
    return Response.json({ error: "Error consultando pymes", detail: error.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const autorizada = await verificarAuth(request, env);
    if (!autorizada) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    await asegurarTablaPymes(env);

    const body = await request.json().catch(() => ({}));
    const nombreEmpresa = String(body.nombre_empresa || '').trim();
    const nombreTitulado = String(body.nombre_titulado || '').trim();
    const anoTitulacion = String(body.ano_titulacion || '').trim();
    const rubro = String(body.rubro || '').trim();
    const ciudad = String(body.ciudad || '').trim();
    const cobertura = String(body.cobertura || '').trim();
    const telefono = String(body.telefono || '').trim();
    const whatsapp = String(body.whatsapp || body.telefono || '').trim();
    const email = String(body.email || '').trim();
    const sitioWeb = String(body.sitio_web || '').trim();
    const instagram = String(body.instagram || '').trim();
    const facebook = String(body.facebook || '').trim();
    const descripcion = String(body.descripcion || '').trim();
    const serviciosDetalle = String(body.servicios_detalle || '').trim();

    if (!nombreEmpresa) {
      return Response.json({ error: "El nombre de la empresa o emprendimiento es obligatorio." }, { status: 400 });
    }
    if (!nombreTitulado) {
      return Response.json({ error: "El nombre del colega titulado UACh es obligatorio." }, { status: 400 });
    }
    if (!rubro) {
      return Response.json({ error: "La especialidad o rubro es obligatorio." }, { status: 400 });
    }
    if (!whatsapp) {
      return Response.json({ error: "El número de WhatsApp o teléfono es obligatorio." }, { status: 400 });
    }
    if (!descripcion) {
      return Response.json({ error: "Una breve descripción de los servicios es obligatoria." }, { status: 400 });
    }

    const id = 'pyme_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const ahoraIso = new Date().toISOString().slice(0, 10);

    await env.DB.prepare(`
      INSERT INTO pymes_colegas (
        id, nombre_empresa, nombre_titulado, ano_titulacion, rubro, ciudad,
        cobertura, telefono, whatsapp, email, sitio_web, instagram, facebook,
        descripcion, servicios_detalle, estado, fecha_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'publicada', ?)
    `).bind(
      id,
      nombreEmpresa,
      nombreTitulado,
      anoTitulacion,
      rubro,
      ciudad,
      cobertura,
      telefono,
      whatsapp,
      email,
      sitioWeb,
      instagram,
      facebook,
      descripcion,
      serviciosDetalle,
      ahoraIso
    ).run();

    return Response.json({
      ok: true,
      mensaje: "¡Empresa inscrita exitosamente en la vitrina de colegas!",
      id
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error registrando pyme", detail: error.message }, { status: 500 });
  }
}
