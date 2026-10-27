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
    "fldQJQrlaOtve2OAW": empresa || "Desconocida",          // ID del campo Empresa
    "fld6sR8bmBZVTq5Ei": id_empresa || "N/A",     // Reemplaza esto con el ID de ID_Empresa
    "fldacH2zo0gZNICgX": fecha || new Date().toISOString() // Reemplaza esto con el ID de Fecha_Clic
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
    console.error("Fallo completo:", error.message);
    return res.status(500).json({ error: error.message });
  }