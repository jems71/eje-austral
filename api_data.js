// /api/data.js
// Lee Contactos, Solicitudes, Alertas y Recomendaciones de Airtable.
// Esta versión expone errores específicos en _errors para diagnóstico.

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
  if (req.method !== 'GET') {
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

  // Captura errores por tabla para que sean visibles
  const errors = {};

  const fetchTable = async (tableName) => {
    try {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?pageSize=100`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
      if (!r.ok) {
        const txt = await r.text();
        errors[tableName] = `${r.status}: ${txt.slice(0, 200)}`;
        return [];
      }
      const json = await r.json();
      return (json.records || []).map(rec => ({ _id: rec.id, ...rec.fields }));
    } catch (err) {
      errors[tableName] = String(err.message || err);
      return [];
    }
  };

  const [contactos, solicitudes, alertas, recomendaciones] = await Promise.all([
    fetchTable('Contactos'),
    fetchTable('Solicitudes'),
    fetchTable('Alertas'),
    fetchTable('Recomendaciones'),
  ]);

  res.setHeader('Cache-Control', 'private, no-store');

  return res.status(200).json({
    contactos,
    solicitudes,
    alertas,
    recomendaciones,
    _errors: Object.keys(errors).length > 0 ? errors : undefined,
    _counts: {
      contactos: contactos.length,
      solicitudes: solicitudes.length,
      alertas: alertas.length,
      recomendaciones: recomendaciones.length
    }
  });
}
