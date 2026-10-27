function cleanBaseId(raw) {
  if (!raw) return 'appAI7XSQjwnEJjYj';
  const m = raw.match(/app[A-Za-z0-9]+/);
  return m ? m[0] : raw.trim();
}

function cleanTableId(raw) {
  if (!raw) return 'tblGakI9RcxKziGET';
  const m = raw.match(/tbl[A-Za-z0-9]+/);
  return m ? m[0] : raw.trim();
}

export default async function handler(req, res) {
  // 1. Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // 2. Parseo seguro de los datos que envía el botón
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { empresa, id_empresa, fecha } = body;

  // 3. Traemos y sanitizamos las credenciales
  const AIRTABLE_TOKEN = (process.env.AIRTABLE_TOKEN || '').trim();
  const BASE_ID = cleanBaseId(process.env.AIRTABLE_BASE_ID);
  const TABLE_NAME = cleanTableId(process.env.AIRTABLE_TABLE);

  if (!AIRTABLE_TOKEN) {
    console.error("❌ Falta variable de entorno AIRTABLE_TOKEN");
    return res.status(500).json({ error: 'Falta AIRTABLE_TOKEN en Vercel.' });
  }

  console.log(`📡 Llamando a Airtable: Base ID = "${BASE_ID}", Tabla = "${TABLE_NAME}"`);

  try {
    // 4. Petición a Airtable con la estructura fields correcta y typecast
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          "Empresa": empresa || "Empresa Desconocida",
          "ID_Empresa": id_empresa || "N/A",
          "Fecha_Clic": fecha || new Date().toISOString()
        },
        typecast: true
      })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      data = { raw: responseText };
    }

    // 5. Si Airtable rechaza la petición, mostramos el error detallado
    if (!response.ok) {
      console.error(`❌ Error de Airtable ${response.status}:`, data, `(URL consultada: ${url})`);
      return res.status(response.status).json({
        error: 'Airtable rechazó el registro',
        status: response.status,
        urlConsultada: url,
        baseId: BASE_ID,
        tableName: TABLE_NAME,
        detail: data
      });
    }

    // 6. Si todo sale bien, devolvemos éxito
    console.log("✅ Clic registrado con éxito en Airtable. ID:", data.id);
    return res.status(200).json({ success: true, recordId: data.id, data });

  } catch (error) {
    console.error("❌ Error del servidor:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
