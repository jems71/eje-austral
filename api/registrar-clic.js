function getAirtableTarget() {
  const rawBase = (process.env.AIRTABLE_BASE_ID || '').trim();
  const rawTable = (process.env.AIRTABLE_TABLE || '').trim();

  // 1. Extraer o normalizar el Base ID (debe ser siempre appXXXXXXXXXXXXXX)
  let baseId = 'appAI7XSQjwnEJjYj';
  const matchApp = (rawBase + ' ' + rawTable).match(/app[A-Za-z0-9]+/i);
  if (matchApp) {
    baseId = 'app' + matchApp[0].replace(/^app/i, '');
  } else {
    // Si viene sin el prefijo "app", ej: "AI7XSQjwnEJjYj"
    const firstPart = rawBase.split('/')[0].trim();
    if (firstPart.length >= 10) {
      baseId = firstPart.startsWith('app') ? firstPart : 'app' + firstPart;
    }
  }

  // 2. Extraer o normalizar el Table ID (debe ser tblGakI9RcxKziGET)
  let tableId = 'tblGakI9RcxKziGET';
  const matchTbl = (rawBase + ' ' + rawTable).match(/tbl[A-Za-z0-9]+/i);
  if (matchTbl) {
    tableId = matchTbl[0];
  }

  return { baseId, tableId };
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
  const { baseId, tableId } = getAirtableTarget();

  if (!AIRTABLE_TOKEN) {
    console.error("❌ Falta variable de entorno AIRTABLE_TOKEN");
    return res.status(500).json({ error: 'Falta AIRTABLE_TOKEN en Vercel.' });
  }

  const url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
  console.log(`📡 Llamando a Airtable URL: "${url}"`);

  try {
    // 4. Petición a Airtable con la estructura fields correcta y typecast
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
        baseId: baseId,
        tableId: tableId,
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
