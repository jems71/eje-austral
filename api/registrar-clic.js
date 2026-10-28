function getAirtableTarget() {
  const rawBase = (process.env.AIRTABLE_BASE_ID || '').trim();
  const rawTable = (process.env.AIRTABLE_TABLE || '').trim();

  // 1. Extraer o normalizar el Base ID (debe ser siempre appXXXXXXXXXXXXXX)
  let baseId = 'appAI7XSQjwnEJjYj';
  const matchApp = (rawBase + ' ' + rawTable).match(/app[A-Za-z0-9]+/i);
  if (matchApp) {
    baseId = 'app' + matchApp[0].replace(/^app/i, '');
  } else {
    const firstPart = rawBase.split('/')[0].trim();
    if (firstPart.length >= 10) {
      baseId = firstPart.startsWith('app') ? firstPart : 'app' + firstPart;
    }
  }

  // 2. Extraer o normalizar el Table ID (tblGakI9RcxKziGET)
  let tableId = 'tblGakI9RcxKziGET';
  const matchTbl = (rawBase + ' ' + rawTable).match(/tbl[A-Za-z0-9]+/i);
  if (matchTbl) {
    tableId = matchTbl[0];
  }

  return { baseId, tableId };
}

// Helpers para detectar nombres de campos con o sin guion bajo
function getFieldNames(fields = {}) {
  const clicsKey = ('Total_Clics' in fields) ? 'Total_Clics' : (('Total Clics' in fields) ? 'Total Clics' : (('Clics' in fields) ? 'Clics' : 'Total_Clics'));
  const ultimoKey = ('Ultimo_Clic' in fields) ? 'Ultimo_Clic' : (('Último Clic' in fields) ? 'Último Clic' : (('Fecha_Clic' in fields) ? 'Fecha_Clic' : (('Fecha Clic' in fields) ? 'Fecha Clic' : 'Ultimo_Clic')));
  const inicioKey = ('Fecha_Inicio' in fields) ? 'Fecha_Inicio' : (('Fecha Inicio' in fields) ? 'Fecha Inicio' : 'Fecha_Inicio');
  return { clicsKey, ultimoKey, inicioKey };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const empresaNombre = (body.empresa || 'Empresa Desconocida').trim();
  const idEmpresa = (body.id_empresa || 'N/A').trim();
  const fechaAhora = new Date().toISOString();
  const fechaHoy = fechaAhora.split('T')[0]; // YYYY-MM-DD

  const AIRTABLE_TOKEN = (process.env.AIRTABLE_TOKEN || '').trim();
  const { baseId, tableId } = getAirtableTarget();

  if (!AIRTABLE_TOKEN) {
    console.error("❌ Falta variable de entorno AIRTABLE_TOKEN");
    return res.status(500).json({ error: 'Falta AIRTABLE_TOKEN en Vercel.' });
  }

  const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    let existingRecord = null;

    // 1. Si viene un record ID directo de Airtable (ej: recXXXXXXXXXXXXXX)
    if (idEmpresa.startsWith('rec') && idEmpresa.length >= 14 && !idEmpresa.includes('_')) {
      const getUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${idEmpresa}`;
      const getRes = await fetch(getUrl, { headers });
      if (getRes.ok) {
        existingRecord = await getRes.json();
      }
    }

    // 2. Si no lo encontramos por recId, buscamos por ID_Empresa o por Nombre de Empresa
    if (!existingRecord && idEmpresa !== 'N/A') {
      const formula = encodeURIComponent(`OR({ID_Empresa}='${idEmpresa}', {Empresa}='${empresaNombre}')`);
      const searchUrl = `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula=${formula}&maxRecords=1`;
      const searchRes = await fetch(searchUrl, { headers });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        if (searchData.records && searchData.records.length > 0) {
          existingRecord = searchData.records[0];
        }
      }
    }

    // ========================================================
    // CASO A: LA EMPRESA YA EXISTE -> INCREMENTAMOS (+1)
    // ========================================================
    if (existingRecord) {
      const recId = existingRecord.id;
      const fields = existingRecord.fields || {};
      const { clicsKey, ultimoKey } = getFieldNames(fields);

      const clicsActuales = Number(fields[clicsKey] || 0);
      const nuevoTotal = clicsActuales + 1;

      const patchPayload = {
        fields: {
          [clicsKey]: nuevoTotal,
          [ultimoKey]: fechaAhora
        },
        typecast: true
      };

      const patchUrl = `https://api.airtable.com/v0/${baseId}/${tableId}/${recId}`;
      const patchRes = await fetch(patchUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(patchPayload)
      });

      const patchData = await patchRes.json();
      if (!patchRes.ok) {
        console.error("❌ Error al incrementar clics:", patchData);
        return res.status(patchRes.status).json({ error: 'Error al actualizar contador', detail: patchData });
      }

      console.log(`✅ Contador incrementado: "${empresaNombre}" (${recId}) -> Total: ${nuevoTotal} clics`);
      return res.status(200).json({
        success: true,
        action: 'increment',
        empresa: empresaNombre,
        recordId: recId,
        totalClics: nuevoTotal,
        ultimoClic: fechaAhora
      });
    }

    // ========================================================
    // CASO B: PRIMERA VEZ DE LA EMPRESA -> CREAMOS FILA INICIAL (+1)
    // ========================================================
    const createPayload = {
      fields: {
        "Empresa": empresaNombre,
        "ID_Empresa": idEmpresa,
        "Fecha_Inicio": fechaHoy,
        "Total_Clics": 1,
        "Ultimo_Clic": fechaAhora
      },
      typecast: true
    };

    const createUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(createPayload)
    });

    const createData = await createRes.json();
    if (!createRes.ok) {
      console.error("❌ Error al crear registro inicial:", createData);
      return res.status(createRes.status).json({ error: 'Error al crear registro de empresa', detail: createData });
    }

    console.log(`✅ Fila creada por primera vez para "${empresaNombre}". Total: 1 clic. ID: ${createData.id}`);
    return res.status(200).json({
      success: true,
      action: 'created',
      empresa: empresaNombre,
      recordId: createData.id,
      totalClics: 1,
      fechaInicio: fechaHoy,
      ultimoClic: fechaAhora
    });

  } catch (error) {
    console.error("❌ Error del servidor en /api/registrar-clic:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
