// /api/agregar.js
// Función serverless: agrega un nuevo contacto a la tabla "Contactos" de Airtable.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Faltan variables de entorno' });
  }

  // Vercel parsea automáticamente JSON, pero por las dudas:
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  // Validación mínima
  if (!body || !body.nombre || !body.nombre.trim()) {
    return res.status(400).json({ error: 'El campo "nombre" es obligatorio' });
  }

  // Armamos los fields para Airtable.
  // Sólo enviamos campos con valor (Airtable rechaza algunos campos vacíos).
  const fields = {};
  const allowed = ['id','tipo','rubro','nombre','contacto','fono','whatsapp','email','region','ciudad','recomendadoPor','rating','reviews','ultimoProyecto','notas'];
  for (const k of allowed) {
    if (body[k] !== undefined && body[k] !== null && body[k] !== '') {
      fields[k] = body[k];
    }
  }

  // Si no vino un id, generamos uno
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
      body: JSON.stringify({ fields })
    });

    if (!r.ok) {
      const txt = await r.text();
      console.error('Airtable error:', r.status, txt);
      return res.status(500).json({ error: 'Airtable rechazó el registro', detail: txt });
    }

    const created = await r.json();
    return res.status(200).json({ ok: true, record: { _id: created.id, ...created.fields } });
  } catch (err) {
    console.error('Error escribiendo en Airtable:', err);
    return res.status(500).json({ error: 'Error al escribir', detail: String(err.message || err) });
  }
}
