// /api/limpiar-ofertas.js
// Cron diario (configurado en vercel.json) que borra las ofertas con
// más de 15 días desde su publicación.
//
// Vercel agrega automáticamente el header
//   Authorization: Bearer <CRON_SECRET>
// a las llamadas que hace su propio scheduler, siempre que exista la
// env var CRON_SECRET en el proyecto. Por eso acá no se valida el
// Bearer del grupo, sino este secreto distinto.

const DIAS_VIGENCIA = 15;

export default async function handler(req, res) {
  const authHeader = req.headers.authorization || '';
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  try {
    const listUrl = `https://api.airtable.com/v0/${BASE_ID}/Ofertas`;
    const listRes = await fetch(listUrl, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const listText = await listRes.text();
    if (!listRes.ok) {
      console.error('Airtable rechazó (listar):', listRes.status, listText);
      return res.status(500).json({ error: 'Error listando ofertas', detail: listText });
    }
    const data = JSON.parse(listText);
    const limite = Date.now() - DIAS_VIGENCIA * 24 * 60 * 60 * 1000;

    const vencidas = (data.records || []).filter(rec => {
      const f = rec.fields.fecha_publicacion;
      if (!f) return false;
      return new Date(f).getTime() < limite;
    });

    if (vencidas.length === 0) {
      return res.status(200).json({ ok: true, eliminadas: 0 });
    }

    // Airtable permite borrar hasta 10 records por request
    let eliminadas = 0;
    for (let i = 0; i < vencidas.length; i += 10) {
      const lote = vencidas.slice(i, i + 10);
      const params = lote.map(r => `records[]=${r.id}`).join('&');
      const delUrl = `https://api.airtable.com/v0/${BASE_ID}/Ofertas?${params}`;
      const delRes = await fetch(delUrl, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
      if (delRes.ok) eliminadas += lote.length;
      else console.error('Error borrando lote:', await delRes.text());
    }

    return res.status(200).json({ ok: true, eliminadas });
  } catch (err) {
    console.error('Error en limpiar-ofertas:', err);
    return res.status(500).json({ error: 'Error inesperado', detail: String(err.message || err) });
  }
}
