// /api/ficha.js
// Acceso público por token (sin login de grupo): permite que un contacto
// vea y edite solo su propia ficha (estado, whatsapp, ciudad, rubro).
// No expone quién lo recomendó ni ningún otro dato interno.

const EDITABLE_FIELDS = ['estado_disponibilidad', 'whatsapp', 'ciudad', 'rubro'];
const ESTADOS_VALIDOS = ['Disponible', 'Ocupado', 'Ya no trabaja en el rubro'];
const TOKEN_RE = /^[A-Za-z0-9-]{8,64}$/; // evita inyección en la fórmula de Airtable

function airtableHeaders() {
  return {
    Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  };
}

function getBaseId() {
  const raw = process.env.AIRTABLE_BASE_ID || '';
  return raw.match(/app[A-Za-z0-9]+/)?.[0] || raw.trim();
}

async function findByToken(token) {
  const BASE_ID = getBaseId();
  const formula = encodeURIComponent(`{token_acceso}='${token}'`);
  const url = `https://api.airtable.com/v0/${BASE_ID}/Contactos?filterByFormula=${formula}&maxRecords=1`;
  const r = await fetch(url, { headers: airtableHeaders() });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Airtable (${r.status}): ${txt.slice(0, 200)}`);
  }
  const json = await r.json();
  return (json.records || [])[0] || null;
}

export default async function handler(req, res) {
  if (!process.env.AIRTABLE_TOKEN || !process.env.AIRTABLE_BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }
  const BASE_ID = getBaseId();

  res.setHeader('Cache-Control', 'private, no-store');

  // --- GET: cargar la ficha ---
  if (req.method === 'GET') {
    const t = String(req.query.t || '').trim();
    if (!TOKEN_RE.test(t)) return res.status(404).json({ error: 'Link no válido' });

    try {
      const record = await findByToken(t);
      if (!record) return res.status(404).json({ error: 'Link no válido' });

      const f = record.fields || {};
      return res.status(200).json({
        nombre: f.nombre || '',
        rubro: f.rubro || '',
        ciudad: f.ciudad || '',
        whatsapp: f.whatsapp || f.fono || '',
        estado_disponibilidad: f.estado_disponibilidad || 'Disponible'
      });
    } catch (err) {
      console.error('Error en GET /api/ficha:', err);
      return res.status(500).json({ error: 'Error al cargar la ficha' });
    }
  }

  // --- POST: guardar cambios ---
  if (req.method === 'POST') {
    let body;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch {
      return res.status(400).json({ error: 'Datos inválidos' });
    }
    const t = String(body.token || '').trim();
    if (!TOKEN_RE.test(t)) return res.status(404).json({ error: 'Link no válido' });

    if (body.estado_disponibilidad && !ESTADOS_VALIDOS.includes(body.estado_disponibilidad)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    try {
      const record = await findByToken(t);
      if (!record) return res.status(404).json({ error: 'Link no válido' });

      const fields = {};
      for (const k of EDITABLE_FIELDS) {
        if (body[k] !== undefined && body[k] !== null) {
          fields[k] = String(body[k]).trim().slice(0, 200);
        }
      }
      // whatsapp es un campo numérico en Airtable: guardar solo dígitos
      if (fields.whatsapp !== undefined) {
        const digits = fields.whatsapp.replace(/\D/g, '');
        if (digits) fields.whatsapp = Number(digits);
        else delete fields.whatsapp;
      }
      if (Object.keys(fields).length === 0) {
        return res.status(400).json({ error: 'Nada que actualizar' });
      }
      fields.fecha_ultima_actualizacion_estado = new Date().toISOString();

      const url = `https://api.airtable.com/v0/${BASE_ID}/Contactos/${record.id}`;
      const r = await fetch(url, {
        method: 'PATCH',
        headers: airtableHeaders(),
        body: JSON.stringify({ fields, typecast: true })
      });

      if (!r.ok) {
        console.error('Airtable rechazó update:', r.status, await r.text());
        return res.status(500).json({ error: 'No se pudo guardar' });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('Error en POST /api/ficha:', err);
      return res.status(500).json({ error: 'Error al guardar' });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
