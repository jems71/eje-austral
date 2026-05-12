// Endpoint POST /api/add
// Agrega un nuevo registro al Directorio.
// Valida la clave de grupo del lado del servidor (esto SÍ protege).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Vercel ya parsea body si Content-Type es JSON, pero por seguridad:
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

  // 1. Verificar clave de grupo (del lado servidor)
  const claveCorrecta = process.env.GRUPO_CLAVE;
  if (!claveCorrecta) {
    return res.status(500).json({ error: 'Servidor mal configurado' });
  }

  const claveRecibida = (body.clave || '').toString().trim().toLowerCase();
  if (claveRecibida !== claveCorrecta.toLowerCase()) {
    return res.status(403).json({ error: 'Clave de grupo incorrecta' });
  }

  // 2. Validar campos obligatorios
  const nombre       = sanitizar(body.nombre);
  const especialidad = sanitizar(body.especialidad);
  const telefono     = sanitizar(body.telefono);
  const comentario   = sanitizar(body.comentario);
  const colega       = sanitizar(body.colega);

  if (!nombre || !colega) {
    return res.status(400).json({ error: 'Faltan nombre o firma del colega' });
  }

  // Validación básica de longitudes para evitar abuso
  if (nombre.length > 200 || comentario.length > 1000 || colega.length > 100) {
    return res.status(400).json({ error: 'Algún campo excede el límite' });
  }

  // 3. Insertar en Airtable
  const token  = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table  = process.env.AIRTABLE_TABLE || 'Directorio';

  if (!token || !baseId) {
    return res.status(500).json({ error: 'Variables de entorno faltantes' });
  }

  try {
    const r = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          Nombre:       nombre,
          Especialidad: especialidad || 'General',
          telefono:     telefono,
          Comentario:   comentario,
          Colega:       colega
        }
      })
    });

    if (!r.ok) {
      const t = await r.text();
      return res.status(502).json({ error: 'Airtable rechazó la inserción', detalle: t });
    }

    const data = await r.json();
    return res.status(201).json({ ok: true, id: data.id });
  } catch (e) {
    return res.status(500).json({ error: 'Error escribiendo en Airtable' });
  }
}

function sanitizar(s) {
  if (s == null) return '';
  return String(s).trim();
}
