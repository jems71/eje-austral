// functions/api/ficha.js — Cloudflare Pages Function con D1
const EDITABLE_FIELDS = ['estado_disponibilidad', 'whatsapp', 'ciudad', 'rubro'];
const ESTADOS_VALIDOS = ['Disponible', 'Ocupado', 'Ya no trabaja en el rubro'];
const TOKEN_RE = /^[A-Za-z0-9-]{8,64}$/;

export async function onRequestGet({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const url = new URL(request.url);
    const token = String(url.searchParams.get('t') || '').trim();
    if (!TOKEN_RE.test(token)) {
      return Response.json({ error: 'Link no válido' }, { status: 404 });
    }

    const record = await env.DB.prepare("SELECT * FROM contactos WHERE token_acceso = ?").bind(token).first();
    if (!record) {
      return Response.json({ error: 'Link no válido o vencido' }, { status: 404 });
    }

    const safeData = {
      id: record.id,
      nombre: record.nombre || '',
      tipo: record.tipo || '',
      rubro: record.rubro || '',
      ciudad: record.ciudad || '',
      whatsapp: record.whatsapp || record.fono || '',
      fono: record.fono || '',
      estado_disponibilidad: record.estado_disponibilidad || 'Disponible',
      fecha_ultima_actualizacion_estado: record.fecha_ultima_actualizacion_estado || null
    };

    return Response.json({
      ok: true,
      ...safeData,
      record: safeData
    }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error en D1 al cargar ficha", detail: error.message }, { status: 500 });
  }
}

async function handleUpdate({ request, env }) {
  try {
    if (!env.DB) {
      return Response.json({ error: "Base de datos D1 no vinculada" }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const token = String(body.token || '').trim();
    if (!TOKEN_RE.test(token)) {
      return Response.json({ error: 'Link no válido' }, { status: 404 });
    }

    const record = await env.DB.prepare("SELECT id FROM contactos WHERE token_acceso = ?").bind(token).first();
    if (!record) {
      return Response.json({ error: 'Link no válido' }, { status: 404 });
    }

    const updates = [];
    const values = [];

    if (body.estado_disponibilidad) {
      const st = String(body.estado_disponibilidad).trim();
      if (!ESTADOS_VALIDOS.includes(st)) {
        return Response.json({ error: 'Estado no válido' }, { status: 400 });
      }
      updates.push("estado_disponibilidad = ?");
      values.push(st);
    }

    if (body.whatsapp !== undefined && body.whatsapp !== null) {
      const digits = String(body.whatsapp).replace(/\D/g, '').slice(0, 20);
      updates.push("whatsapp = ?");
      values.push(digits);
    }

    if (body.ciudad !== undefined && body.ciudad !== null) {
      updates.push("ciudad = ?");
      values.push(String(body.ciudad).trim().slice(0, 100));
    }

    if (body.rubro !== undefined && body.rubro !== null) {
      updates.push("rubro = ?");
      values.push(String(body.rubro).trim().slice(0, 100));
    }

    if (updates.length === 0) {
      return Response.json({ error: 'Nada que actualizar' }, { status: 400 });
    }

    updates.push("fecha_ultima_actualizacion_estado = CURRENT_TIMESTAMP");
    updates.push("actualizado_en = CURRENT_TIMESTAMP");

    values.push(token);

    const sql = `UPDATE contactos SET ${updates.join(', ')} WHERE token_acceso = ?`;
    await env.DB.prepare(sql).bind(...values).run();

    return Response.json({ ok: true }, { status: 200 });

  } catch (error) {
    return Response.json({ error: "Error en D1 al actualizar ficha", detail: error.message }, { status: 500 });
  }
}

export const onRequestPost = handleUpdate;
export const onRequestPatch = handleUpdate;
