// Endpoint GET /api/records
// Devuelve la lista del Directorio desde Airtable.
// El token vive solo en variables de entorno; nunca llega al navegador.

export default async function handler(req, res) {
  // CORS: solo permitimos GET aquí
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table  = process.env.AIRTABLE_TABLE || 'Directorio';

  if (!token || !baseId) {
    return res.status(500).json({ error: 'Variables de entorno faltantes' });
  }

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`
              + `?sort[0][field]=Nombre&sort[0][direction]=asc`;

    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: 'Airtable respondió error', detalle: t });
    }

    const data = await r.json();
    // Cache de 30 segundos en el edge para reducir hits a Airtable
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: 'Error consultando Airtable' });
  }
}
