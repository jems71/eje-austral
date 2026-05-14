// /api/recomendar.js
// Sumá una recomendación a un contacto existente.

import crypto from 'crypto';

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
    return res.status(401).json({ error: 'No autorizado' });
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (!body) return res.status(400).json({ error: 'Sin datos' });
  if (!body.contactoId) return res.status(400).json({ error: 'Falta contactoId' });
  if (!body.autor || !body.autor.trim()) return res.status(400).json({ error: 'Tu nombre es obligatorio' });
  if (!body.comentario || !body.comentario.trim()) return res.status(400).json({ error: 'Escribí algo sobre tu experiencia' });

  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const now = new Date();
  const fecha = `${meses[now.getMonth()]} ${now.getFullYear()}`;

  const fields = {
    id: 'rec-' + Date.now().toString().slice(-8),
    contactoId: String(body.contactoId),
    autor: String(body.autor).trim(),
    comentario: String(body.comentario).trim(),
    proyecto: (body.proyecto || '').trim(),
    fecha: fecha
  };

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/Recomendaciones`;
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, typecast: true })
    });
    const responseText = await r.text();
    if (!r.ok) {
      console.error('Airtable rechazó:', r.status, responseText);
      return res.status(500).json({ error: 'Airtable rechazó la recomendación', airtableResponse: responseText });
    }
    const created = JSON.parse(responseText);
    return res.status(200).json({ ok: true, record: { _id: created.id, ...created.fields } });
  } catch (err) {
    console.error('Error guardando recomendación:', err);
    return res.status(500).json({ error: 'Error al guardar', detail: String(err.message || err) });
  }
}
