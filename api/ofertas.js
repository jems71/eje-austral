// /api/ofertas.js
// Devuelve las ofertas de trabajo vigentes (publicadas hace 15 días o
// menos). Filtra acá como respaldo aunque el cron de limpieza no haya
// corrido todavía ese día — así nunca se ve una oferta vieja.

const DIAS_VIGENCIA = 15;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/Ofertas?sort[0][field]=fecha_publicacion&sort[0][direction]=desc`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const text = await r.text();
    if (!r.ok) {
      console.error('Airtable rechazó:', r.status, text);
      return res.status(500).json({ error: 'Error cargando ofertas', detail: text });
    }
    const data = JSON.parse(text);
    const limite = Date.now() - DIAS_VIGENCIA * 24 * 60 * 60 * 1000;

    const ofertas = (data.records || [])
      .filter(rec => {
        const f = rec.fields.fecha_publicacion;
        if (!f) return false;
        return new Date(f).getTime() >= limite;
      })
      .map(rec => ({
        id: rec.id,
        texto: rec.fields.texto || '',
        fecha_publicacion: rec.fields.fecha_publicacion,
        publicado_por: rec.fields.publicado_por || ''
      }));

    return res.status(200).json({ ok: true, ofertas });
  } catch (err) {
    console.error('Error en /api/ofertas:', err);
    return res.status(500).json({ error: 'Error inesperado', detail: String(err.message || err) });
  }
}
