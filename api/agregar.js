// /api/agregar.js
// Versión con manejo de errores detallado y typecast activado.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!body || !body.nombre || !body.nombre.trim()) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
  }

  // Armamos los fields permitidos
  const fields = {};
  const allowed = ['id','tipo','rubro','nombre','contacto','fono','whatsapp','email','region','ciudad','recomendadoPor','rating','reviews','ultimoProyecto','notas'];
  for (const k of allowed) {
    const v = body[k];
    if (v !== undefined && v !== null && v !== '') {
      // Convertimos rating y reviews a número
      if (k === 'rating' || k === 'reviews') {
        const num = Number(v);
        if (!isNaN(num) && num > 0) fields[k] = num;
      } else {
        fields[k] = v;
      }
    }
  }

  if (!fields.id) {
    fields.id = 'c-' + Date.now().toString().slice(-6);
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/Contactos`;
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      // typecast: true le dice a Airtable "si la opción de Single select no existe, créala"
      body: JSON.stringify({ fields, typecast: true })
    });

    const responseText = await r.text();

    if (!r.ok) {
      // Devolvemos el error EXACTO de Airtable para diagnosticar
      console.error('Airtable rechazó:', r.status, responseText);
      return res.status(500).json({
        error: 'Airtable rechazó el registro',
        airtableStatus: r.status,
        airtableResponse: responseText,
        fieldsSent: fields
      });
    }

    const created = JSON.parse(responseText);
    return res.status(200).json({ ok: true, record: { _id: created.id, ...created.fields } });
  } catch (err) {
    console.error('Error escribiendo en Airtable:', err);
    return res.status(500).json({ error: 'Error al escribir', detail: String(err.message || err) });
  }
}
