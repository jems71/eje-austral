// /api/data.js
// Lee Contactos, Solicitudes, Alertas y Recomendaciones de Airtable.
// Esta versión expone errores específicos en _errors para diagnóstico.
//
// NOTA: ESTADO_REVISION es un campo de control interno de Juan (lo edita
// directo en Airtable) — NO filtra visibilidad. Todos los contactos se
// publican, estén o no revisados.

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

  const TOKEN = (process.env.AIRTABLE_TOKEN || '').trim();
  const BASE_ID = (process.env.AIRTABLE_BASE_ID || '').match(/app[A-Za-z0-9]+/)?.[0] || 'appAI7XSQjwnEJjYj';

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  // Captura errores por tabla para que sean visibles
  const errors = {};

  const fetchTable = async (tableName, filterFormula) => {
    try {
      let records = [];
      let offset = null;
      do {
        let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?pageSize=100`;
        if (filterFormula) url += `&filterByFormula=${encodeURIComponent(filterFormula)}`;
        if (offset) url += `&offset=${encodeURIComponent(offset)}`;

        const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
        if (!r.ok) {
          const txt = await r.text();
          errors[tableName] = `${r.status}: ${txt.slice(0, 200)}`;
          return records.map(rec => ({ _id: rec.id, ...rec.fields }));
        }
        const json = await r.json();
        records = records.concat(json.records || []);
        offset = json.offset || null;
      } while (offset);

      return records.map(rec => ({ _id: rec.id, ...rec.fields }));
    } catch (err) {
      errors[tableName] = String(err.message || err);
      return [];
    }
  };

  const DIAS_VIGENCIA = 15;
  const limiteOfertas = Date.now() - DIAS_VIGENCIA * 24 * 60 * 60 * 1000;

  const fetchOfertas = async () => {
    try {
      const url = `https://api.airtable.com/v0/${BASE_ID}/Ofertas?sort[0][field]=fecha_publicacion&sort[0][direction]=desc`;
      const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
      if (!r.ok) {
        const txt = await r.text();
        errors['Ofertas'] = `${r.status}: ${txt.slice(0, 200)}`;
        return [];
      }
      const data = await r.json();
      return (data.records || [])
        .filter(rec => {
          const f = rec.fields?.fecha_publicacion;
          return f && new Date(f).getTime() >= limiteOfertas;
        })
        .map(rec => ({
          id: rec.id,
          texto: rec.fields.texto || '',
          fecha_publicacion: rec.fields.fecha_publicacion,
          publicado_por: rec.fields.publicado_por || ''
        }));
    } catch (err) {
      errors['Ofertas'] = String(err.message || err);
      return [];
    }
  };

  const [contactos, recomendaciones, ofertas] = await Promise.all([
    fetchTable('Contactos'),
    fetchTable('Recomendaciones'),
    fetchOfertas()
  ]);

  res.setHeader('Cache-Control', 'private, no-store');

  return res.status(200).json({
    contactos,
    recomendaciones,
    ofertas,
    _errors: Object.keys(errors).length > 0 ? errors : undefined,
    _counts: {
      contactos: contactos.length,
      recomendaciones: recomendaciones.length,
      ofertas: ofertas.length
    }
  });
}
