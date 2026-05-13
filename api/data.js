// /api/data.js
// Función serverless de Vercel: lee Contactos, Solicitudes y Alertas desde Airtable.
// Las credenciales viven SOLO acá (lado servidor), nunca llegan al navegador.

export default async function handler(req, res) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno (AIRTABLE_TOKEN o AIRTABLE_BASE_ID)' });
  }

  const fetchTable = async (tableName) => {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?pageSize=100`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    if (!r.ok) {
      const txt = await r.text();
      throw new Error(`Airtable ${tableName}: ${r.status} ${txt}`);
    }
    const json = await r.json();
    // Devolvemos solo los fields, con el id de Airtable agregado
    return (json.records || []).map(rec => ({ _id: rec.id, ...rec.fields }));
  };

  try {
    const [contactos, solicitudes, alertas] = await Promise.all([
      fetchTable('Contactos'),
      fetchTable('Solicitudes').catch(() => []), // si la tabla no existe aún, no rompemos
      fetchTable('Alertas').catch(() => []),
    ]);

    // Caché ligero en el navegador (30 segundos) para no abusar de la API
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

    return res.status(200).json({
      contactos,
      solicitudes,
      alertas,
      // historial lo construimos en frontend para que sea automático
    });
  } catch (err) {
    console.error('Error leyendo Airtable:', err);
    return res.status(500).json({ error: 'Error al leer Airtable', detail: String(err.message || err) });
  }
}
