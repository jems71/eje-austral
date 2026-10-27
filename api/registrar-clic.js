export default async function handler(req, res) {
  // 1. Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // 2. Recibimos los datos que envía el botón desde el HTML
  const { empresa, id_empresa, fecha } = req.body;

  // 3. Traemos las variables de entorno configuradas en Vercel
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE; // Asegúrate de que en Vercel esta variable tenga el valor: tblGakI9RcxKziGET

  try {
    // 4. Hacemos la petición a Airtable usando los IDs de los campos (fld...)
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        body: JSON.stringify({
  fields: {
    "Empresa": empresa || "Empresa Desconocida",
    "ID_Empresa": id_empresa || "N/A",
    "Fecha_Clic": fecha || new Date().toISOString()
  }
})
    });

    // 5. Obtenemos la respuesta de Airtable
    const data = await response.json();

    // 6. Si Airtable rechaza la petición, mostramos el error en los logs
    if (!response.ok) {
      console.error("❌ Error de Airtable:", data);
      return res.status(response.status).json(data);
    }

    // 7. Si todo sale bien, devolvemos éxito
    console.log("✅ Clic registrado con éxito en Airtable");
    return res.status(200).json({ success: true, data });

  } catch (error) {
    // 8. Si hay un error de red o de servidor, lo mostramos
    console.error("❌ Error del servidor:", error.message);
    return res.status(500).json({ error: error.message });
  }
}