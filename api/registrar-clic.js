export default async function handler(req, res) {
  // 1. Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // 2. Parseo seguro de los datos que envía el botón
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { empresa, id_empresa, fecha } = body;

  // 3. Traemos las variables de entorno configuradas en Vercel
  const AIRTABLE_TOKEN = (process.env.AIRTABLE_TOKEN || '').trim();
  const BASE_ID = (process.env.AIRTABLE_BASE_ID || '').trim();
  const TABLE_NAME = (process.env.AIRTABLE_TABLE || 'tblGakI9RcxKziGET').trim();

  if (!AIRTABLE_TOKEN || !BASE_ID) {
    console.error("❌ Faltan variables de entorno AIRTABLE_TOKEN o AIRTABLE_BASE_ID");
    return res.status(500).json({ error: 'Faltan variables de entorno en el servidor.' });
  }

  console.log(`📡 Consultando Airtable -> Base: "${BASE_ID}", Tabla: "${TABLE_NAME}"`);

  try {
    // 4. Petición a Airtable con la estructura fields correcta
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;
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
      console.error(`❌ Error de Airtable ${response.status}:`, data, `(URL: https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME})`);
      return res.status(response.status).json({
        error: 'Airtable rechazó el registro',
        status: response.status,
        baseId: BASE_ID,
        tableName: TABLE_NAME,
        detail: data
      });
    }

    // 6. Si todo sale bien, devolvemos éxito
    console.log("✅ Clic registrado con éxito en Airtable:", data.id);
    return res.status(200).json({ success: true, recordId: data.id, data });

  } catch (error) {
    console.error("❌ Error del servidor:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
