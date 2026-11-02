// functions/api/agregar-oferta.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body || !body.texto || !body.texto.trim()) {
      return Response.json({ error: 'El campo "texto" es obligatorio' }, { status: 400 });
    }

    // Asegurar columnas en la tabla ofertas
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN cargo TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN ciudad TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN empresa TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN experiencia TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN tipo_postulacion TEXT DEFAULT 'interno'").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN contacto_nombre TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN contacto_fono TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN contacto_email TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN publicado_por_fono TEXT DEFAULT ''").run(); } catch(e) {}
    try { await env.DB.prepare("ALTER TABLE ofertas ADD COLUMN fecha_verificacion TEXT DEFAULT ''").run(); } catch(e) {}

    const id = 'of-' + Date.now().toString().slice(-8);
    const ahora = new Date().toISOString();
    const texto = body.texto.trim();
    const publicadoPor = (body.publicado_por || 'Juan Carlos García').trim();

    const cargo = String(body.cargo || '').trim();
    const ciudad = String(body.ciudad || '').trim();
    const empresa = String(body.empresa || '').trim();
    const experiencia = String(body.experiencia || '').trim();
    const tipoPostulacion = String(body.tipo_postulacion || 'interno').trim();
    const contactoNombre = String(body.contacto_nombre || '').trim();
    const contactoFono = String(body.contacto_fono || '').trim();
    const contactoEmail = String(body.contacto_email || '').trim();
    const publicadoPorFono = String(body.publicado_por_fono || '').trim();

    await env.DB.prepare(`
      INSERT INTO ofertas (
        id, texto, publicado_por, fecha_publicacion, estado,
        cargo, ciudad, empresa, experiencia, tipo_postulacion,
        contacto_nombre, contacto_fono, contacto_email, publicado_por_fono, fecha_verificacion
      ) VALUES (?, ?, ?, ?, 'publicada', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, texto, publicadoPor, ahora,
      cargo, ciudad, empresa, experiencia, tipoPostulacion,
      contactoNombre, contactoFono, contactoEmail, publicadoPorFono, ahora
    ).run();

    return Response.json({
      ok: true,
      record: {
        id, texto, publicado_por: publicadoPor, fecha_publicacion: ahora, estado: 'publicada',
        cargo, ciudad, empresa, experiencia, tipo_postulacion: tipoPostulacion,
        contacto_nombre: contactoNombre, contacto_fono: contactoFono,
        contacto_email: contactoEmail, publicado_por_fono: publicadoPorFono
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error en D1 al agregar oferta", detail: error.message }, { status: 500 });
  }
}
