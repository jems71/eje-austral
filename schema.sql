-- ========================================================
-- Schema para Cloudflare D1 (SQLite) — Eje Austral
-- ========================================================

CREATE TABLE IF NOT EXISTS contactos (
  id TEXT PRIMARY KEY,
  tipo TEXT,
  rubro TEXT,
  nombre TEXT NOT NULL,
  contacto TEXT,
  fono TEXT,
  whatsapp TEXT,
  email TEXT,
  region TEXT,
  ciudad TEXT,
  recomendado_por TEXT,
  rating REAL DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  ultimo_proyecto TEXT,
  notas TEXT,
  token_acceso TEXT UNIQUE,
  estado_disponibilidad TEXT DEFAULT 'Disponible',
  fecha_ingreso TEXT,
  fecha_ultima_actualizacion_estado TEXT,
  estado_publicacion TEXT DEFAULT 'publicado',
  consentimiento_publicacion INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recomendaciones (
  id TEXT PRIMARY KEY,
  contacto_id TEXT NOT NULL,
  autor TEXT,
  comentario TEXT,
  proyecto TEXT,
  fecha TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (contacto_id) REFERENCES contactos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ofertas (
  id TEXT PRIMARY KEY,
  texto TEXT NOT NULL,
  publicado_por TEXT,
  fecha_publicacion TEXT NOT NULL,
  estado TEXT DEFAULT 'publicada',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS empresas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_empresa TEXT UNIQUE NOT NULL,
  empresa TEXT NOT NULL,
  fecha_inicio TEXT,
  total_clics INTEGER DEFAULT 0,
  ultimo_clic TEXT,
  estado TEXT DEFAULT 'Prueba Gratis (60 días)',
  created_at TEXT DEFAULT (datetime('now'))
);

-- Índices para búsqueda ultra rápida (<5ms)
CREATE INDEX IF NOT EXISTS idx_contactos_tipo ON contactos(tipo);
CREATE INDEX IF NOT EXISTS idx_contactos_ciudad ON contactos(ciudad);
CREATE INDEX IF NOT EXISTS idx_contactos_rubro ON contactos(rubro);
CREATE INDEX IF NOT EXISTS idx_contactos_token ON contactos(token_acceso);
CREATE INDEX IF NOT EXISTS idx_contactos_pub ON contactos(estado_publicacion);
CREATE INDEX IF NOT EXISTS idx_empresas_id_empresa ON empresas(id_empresa);
CREATE INDEX IF NOT EXISTS idx_ofertas_fecha ON ofertas(fecha_publicacion);
