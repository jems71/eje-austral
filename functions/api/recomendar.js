// functions/api/recomendar.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    if (!body.contactoId) return Response.json({ error: 'Falta contactoId' }, { status: 400 });
    if (!body.autor || !body.autor.trim()) return Response.json({ error: 'Tu nombre y apellido son obligatorios' }, { status: 400 });
    if (!body.proyecto || !body.proyecto.trim()) return Response.json({ error: 'La obra o faena ejecutada es obligatoria' }, { status: 400 });

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const now = new Date();
    const fecha = `${meses[now.getMonth()]} ${now.getFullYear()}`;
    const id = 'rec-' + Date.now().toString().slice(-8);

    const autor = String(body.autor).trim();
    const cargoAutor = String(body.cargoAutor || body.cargo_autor || '').trim();
    const fonoAutor = String(body.fonoAutor || body.fono_autor || '').trim();
    const proyecto = String(body.proyecto).trim();
    const comentario = String(body.comentario || '').trim();

    // Nueva recomendación entra con estado 'pendiente' para moderación del admin
    await env.DB.prepare(`
      INSERT INTO recomendaciones (id, contacto_id, autor, cargo_autor, fono_autor, proyecto, comentario, fecha, estado, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', CURRENT_TIMESTAMP)
    `).bind(
      id,
      String(body.contactoId),
      autor,
      cargoAutor,
      fonoAutor,
      proyecto,
      comentario,
      fecha
    ).run();

    return Response.json({
      ok: true,
      pendiente: true,
      mensaje: 'Recomendación enviada correctamente. Será visible una vez verificada por la red.',
      record: {
        id,
        contacto_id: String(body.contactoId),
        autor,
        cargo_autor: cargoAutor,
        fono_autor: fonoAutor,
        proyecto,
        comentario,
        fecha,
        estado: 'pendiente'
      }
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error en D1 al guardar recomendación", detail: error.message }, { status: 500 });
  }
}
