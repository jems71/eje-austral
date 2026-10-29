// functions/api/agregar-rubro.js — Cloudflare Pages Function con D1
export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id || '').trim();
    const nuevoRubro = String(body.rubro || '').trim();

    if (!id) {
      return Response.json({ error: "El id del contacto es obligatorio" }, { status: 400 });
    }
    if (!nuevoRubro) {
      return Response.json({ error: "El nuevo rubro es obligatorio" }, { status: 400 });
    }

    const contacto = await env.DB.prepare("SELECT id, nombre, rubro FROM contactos WHERE id = ?").bind(id).first();
    if (!contacto) {
      return Response.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    // Normalizar y unir rubros sin duplicar
    const rubrosExistentes = (contacto.rubro || '')
      .split(/[,/•;]+/)
      .map(r => r.trim())
      .filter(Boolean);

    const yaExiste = rubrosExistentes.some(r => r.toLowerCase() === nuevoRubro.toLowerCase());
    let rubroFinal = contacto.rubro || '';

    if (!yaExiste) {
      if (rubroFinal.trim()) {
        rubroFinal = `${rubroFinal}, ${nuevoRubro}`;
      } else {
        rubroFinal = nuevoRubro;
      }

      await env.DB.prepare("UPDATE contactos SET rubro = ? WHERE id = ?").bind(rubroFinal, id).run();
    }

    // Si además viene una recomendación o comentario asociado al nuevo rubro, registrarla
    const autor = String(body.recomendado_por || body.autor || '').trim();
    const comentario = String(body.comentario || body.notas || '').trim() || (yaExiste ? '' : `Recomendado también en rubro: ${nuevoRubro}`);
    const proyecto = String(body.proyecto || body.ultimo_proyecto || '').trim();

    if (autor || comentario) {
      const recId = 'rec-' + Date.now().toString().slice(-6);
      const hoy = new Date().toISOString().slice(0, 10);
      try {
        await env.DB.prepare(`
          INSERT INTO recomendaciones (id, autor, contacto_id, comentario, proyecto, fecha)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          recId,
          autor || 'Colega de la red',
          id,
          comentario,
          proyecto,
          hoy
        ).run();
      } catch (errRec) {
        console.warn("No se pudo insertar recomendación complementaria:", errRec);
      }
    }

    return Response.json({
      ok: true,
      id,
      nombre: contacto.nombre,
      rubroAnterior: contacto.rubro,
      rubro: rubroFinal,
      rubroAgregado: !yaExiste
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error al agregar rubro en D1", detail: error.message }, { status: 500 });
  }
}
