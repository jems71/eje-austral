// /api/agregar-oferta.js
// Publica una oferta de trabajo tal como se pegó. Pensado para que SOLO
// vos la uses (no hay formulario público para el grupo) — requiere el
// mismo Bearer del login de grupo.

import crypto from 'crypto';

// Misma validación real que usa /api/data.js.
function isAuthorized(req) {
  const APP_PASSWORD = process.env.APP_PASSWORD;
  if (!APP_PASSWORD) return false;
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return false;
  const expected = crypto.createHmac('sha256', APP_PASSWORD).update('grupo-uach-session').digest('hex');
  return token === expected;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión.' });
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!body || !body.texto || !body.texto.trim()) {
    return res.status(400).json({ error: 'El campo "texto" es obligatorio' });
  }

  const fields = {
    texto: body.texto.trim(),
    fecha_publicacion: new Date().toISOString(),
    publicado_por: (body.publicado_por || '').trim() || 'Admin'
  };

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/Ofertas`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields, typecast: true })
    });
    const responseText = await r.text();
    if (!r.ok) {
      console.error('Airtable rechazó:', r.status, responseText);
      return res.status(500).json({ error: 'Airtable rechazó la oferta', detail: responseText });
    }
    const created = JSON.parse(responseText);
    return res.status(200).json({ ok: true, record: { _id: created.id, ...created.fields } });
  } catch (err) {
    console.error('Error publicando oferta:', err);
    return res.status(500).json({ error: 'Error inesperado', detail: String(err.message || err) });
  }
}
