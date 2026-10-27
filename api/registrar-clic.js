export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { empresa, id_empresa, fecha } = req.body;

  // Usamos tus variables de Vercel
  const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE; 

  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          "Empresa": empresa || "Desconocida",
          "ID_Empresa": id_empresa || "N/A",
          "Fecha_Clic": fecha || new Date().toISOString()
        }
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Airtable:", errorData);
        throw new Error('Error en Airtable');
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Error guardando' });
  }
}