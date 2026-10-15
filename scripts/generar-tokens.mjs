// Uso (Node 18+), desde la carpeta del repo:
//   AIRTABLE_TOKEN=xxx AIRTABLE_BASE_ID=appXXXX BASE_URL=https://tu-dominio node scripts/generar-tokens.mjs --dry-run
//   (sin --dry-run escribe los tokens en Airtable)
// Solo toca contactos que NO tienen token_acceso; los que ya tienen se respetan.
// Al final genera links-whatsapp.csv con el link de cada contacto y un wa.me con el mensaje listo.

import { randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';

let { AIRTABLE_TOKEN, AIRTABLE_BASE_ID, BASE_URL } = process.env;
const DRY = process.argv.includes('--dry-run');

AIRTABLE_TOKEN = (AIRTABLE_TOKEN || '').trim();
// Extrae solo el ID de la base (appXXXXXXXXXXXXXX) en caso de que se pase una URL o subrutas
AIRTABLE_BASE_ID = (AIRTABLE_BASE_ID || '').match(/app[A-Za-z0-9]+/)?.[0] || (AIRTABLE_BASE_ID || '').trim();
BASE_URL = (BASE_URL || '').trim();

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !BASE_URL) {
  console.error('Faltan variables: AIRTABLE_TOKEN, AIRTABLE_BASE_ID, BASE_URL');
  process.exit(1);
}

const api = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Contactos`;
const headers = { Authorization: `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' };

async function listAll() {
  let out = [], offset;
  do {
    const url = api + '?pageSize=100' + (offset ? `&offset=${offset}` : '');
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`Airtable ${r.status}: ${await r.text()}`);
    const j = await r.json();
    out = out.concat(j.records);
    offset = j.offset;
  } while (offset);
  return out;
}

function waNumber(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('56')) return d;
  if (d.length === 9) return '56' + d;
  return d;
}

const records = await listAll();
console.log(`Contactos encontrados: ${records.length}`);

const pendientes = records.filter(r => !r.fields.token_acceso);
console.log(`Sin token: ${pendientes.length}`);

const nuevos = new Map();
for (const r of pendientes) nuevos.set(r.id, randomUUID());

if (!DRY) {
  const lista = [...nuevos.entries()];
  for (let i = 0; i < lista.length; i += 10) {
    const lote = lista.slice(i, i + 10).map(([id, t]) => ({ id, fields: { token_acceso: t } }));
    const r = await fetch(api, { method: 'PATCH', headers, body: JSON.stringify({ records: lote }) });
    if (!r.ok) throw new Error(`Falló el lote ${i / 10 + 1}: ${await r.text()}`);
    console.log(`Lote ${i / 10 + 1} OK (${lote.length})`);
    await new Promise(res => setTimeout(res, 250)); // límite de 5 req/seg de Airtable
  }
} else {
  console.log('DRY RUN: no se escribió nada en Airtable (el CSV de abajo tiene tokens de prueba que NO son los definitivos).');
}

const TIPOS_PARA_ENVIAR = ['Subcontrato', 'Mano de obra', 'Profesional'];
const contactosParaEnviar = records.filter(r => TIPOS_PARA_ENVIAR.includes(r.fields.tipo));
console.log(`Filtrados para envío (${TIPOS_PARA_ENVIAR.join(', ')}): ${contactosParaEnviar.length} de ${records.length}`);

const esc = s => `"${String(s ?? '').replace(/"/g, '""')}"`;
const filas = ['tipo,nombre,rubro,ciudad,whatsapp,link,wa_me'];
for (const r of contactosParaEnviar) {
  const token = r.fields.token_acceso || nuevos.get(r.id);
  const link = `${BASE_URL.replace(/\/$/, '')}/ficha/${token}`;
  const num = waNumber(r.fields.whatsapp || r.fields.fono);
  const tipo = r.fields.tipo || '';
  const rubro = r.fields.rubro || '';
  const ciudad = r.fields.ciudad || '';
  const nombre = (r.fields.nombre || '').trim();

  const msg = `${saludo}, te saludamos de la Red de Constructores Civiles e Ingenieros en Construcción UACh (Eje Austral).\n\nTenemos tu contacto registrado en nuestro directorio de servicios y subcontratos de la zona sur. Los constructores civiles e ingenieros en construcción de la red consultamos esta lista para cotizar y asignar faenas.\n\nPara que podamos llamarte cuando salgan proyectos que coincidan con tu especialidad, por favor indícanos si estás Disponible u Ocupado en tu ficha:\n👉 ${link}`;
  const wa = num ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}` : '';

  filas.push([
    esc(tipo),
    esc(nombre),
    esc(rubro),
    esc(ciudad),
    esc(num),
    esc(link),
    esc(wa)
  ].join(','));
}
writeFileSync('links-whatsapp.csv', '\uFEFF' + filas.join('\n'), 'utf8');
console.log('Listo: links-whatsapp.csv generado con tipo, rubro, ciudad y mensaje personalizado.');
