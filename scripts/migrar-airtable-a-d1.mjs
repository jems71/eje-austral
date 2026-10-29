// scripts/migrar-airtable-a-d1.mjs
// Descarga todas las tablas de Airtable (Contactos, Recomendaciones, Ofertas)
// y genera un archivo `seed-d1.sql` listo para importar en Cloudflare D1.

import { writeFileSync } from 'node:fs';

const TOKEN = (process.env.AIRTABLE_TOKEN || '').trim();
const rawBase = (process.env.AIRTABLE_BASE_ID || '').trim();
const BASE_ID = rawBase.match(/app[A-Za-z0-9]+/i)?.[0] || 'appAI7XSQjwnEJjYj';

if (!TOKEN) {
  console.error("❌ Debes pasar AIRTABLE_TOKEN como variable de entorno.");
  console.log("Uso: $env:AIRTABLE_TOKEN='pat...'; node scripts/migrar-airtable-a-d1.mjs");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${TOKEN}` };

async function fetchAirtable(table) {
  let records = [];
  let offset = null;
  do {
    let url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}?pageSize=100`;
    if (offset) url += `&offset=${encodeURIComponent(offset)}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`Aviso: tabla ${table} devolvió ${res.status}: ${await res.text()}`);
      break;
    }
    const data = await res.json();
    records = records.concat(data.records || []);
    offset = data.offset;
  } while (offset);
  return records;
}

const esc = val => {
  if (val === undefined || val === null) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
};

const num = val => {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
};

async function main() {
  console.log(`📡 Conectando a Airtable (Base: ${BASE_ID})...`);

  console.log("📥 Descargando Contactos...");
  const contactos = await fetchAirtable('Contactos');
  console.log(`   -> ${contactos.length} contactos descargados.`);

  console.log("📥 Descargando Recomendaciones...");
  const recomendaciones = await fetchAirtable('Recomendaciones');
  console.log(`   -> ${recomendaciones.length} recomendaciones descargadas.`);

  console.log("📥 Descargando Ofertas...");
  const ofertas = await fetchAirtable('Ofertas');
  console.log(`   -> ${ofertas.length} ofertas descargadas.`);

  const sqlLines = [];
  sqlLines.push('-- ========================================================');
  sqlLines.push('-- Datos migrados desde Airtable a Cloudflare D1');
  sqlLines.push(`-- Generado el: ${new Date().toISOString()}`);
  sqlLines.push('-- ========================================================\n');

  // 1. Insert contactos
  for (const r of contactos) {
    const f = r.fields || {};
    const id = r.id;
    sqlLines.push(`INSERT OR REPLACE INTO contactos (id, tipo, rubro, nombre, contacto, fono, whatsapp, email, region, ciudad, recomendado_por, rating, reviews, ultimo_proyecto, notas, token_acceso, estado_disponibilidad, fecha_ingreso, fecha_ultima_actualizacion_estado, estado_publicacion, consentimiento_publicacion) VALUES (${esc(id)}, ${esc(f.tipo)}, ${esc(f.rubro)}, ${esc(f.nombre || 'Sin nombre')}, ${esc(f.contacto)}, ${esc(f.fono)}, ${esc(f.whatsapp)}, ${esc(f.email)}, ${esc(f.region)}, ${esc(f.ciudad)}, ${esc(f.recomendadoPor || f.recomendado_por)}, ${num(f.rating)}, ${num(f.reviews)}, ${esc(f.ultimoProyecto || f.ultimo_proyecto)}, ${esc(f.notas)}, ${esc(f.token_acceso)}, ${esc(f.estado_disponibilidad || 'Disponible')}, ${esc(f.fecha_ingreso)}, ${esc(f.fecha_actualizacion_estado || f.fecha_ultima_actualizacion_estado)}, 'publicado', 1);`);
  }

  // 2. Insert recomendaciones
  for (const r of recomendaciones) {
    const f = r.fields || {};
    const id = r.id;
    const contactoId = Array.isArray(f.contacto) ? f.contacto[0] : (f.contacto_id || f.contacto || '');
    sqlLines.push(`INSERT OR REPLACE INTO recomendaciones (id, contacto_id, autor, comentario, proyecto, fecha) VALUES (${esc(id)}, ${esc(contactoId)}, ${esc(f.autor)}, ${esc(f.comentario)}, ${esc(f.proyecto || '')}, ${esc(f.fecha)});`);
  }

  // 3. Insert ofertas
  for (const r of ofertas) {
    const f = r.fields || {};
    const id = r.id;
    sqlLines.push(`INSERT OR REPLACE INTO ofertas (id, texto, publicado_por, fecha_publicacion, estado) VALUES (${esc(id)}, ${esc(f.texto || '')}, ${esc(f.publicado_por || '')}, ${esc(f.fecha_publicacion || new Date().toISOString())}, 'publicada');`);
  }

  const outPath = 'seed-d1.sql';
  writeFileSync(outPath, sqlLines.join('\n'), 'utf-8');
  console.log(`\n🎉 Migración preparada con éxito en "${outPath}"!`);
  console.log(`   Total sentencias SQL: ${sqlLines.length - 4}`);
}

main().catch(err => {
  console.error("❌ Error en la migración:", err);
});
