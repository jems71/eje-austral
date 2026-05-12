# Eje Austral · Directorio UACh

Directorio web colaborativo de proveedores y servicios técnicos
recomendados por la Red de Titulados Miraflores - UACh.

## Características

- Listado público de proveedores con búsqueda en tiempo real
- Permisos: **leer libremente** + **agregar con clave de grupo** (no se edita lo existente)
- Backend serverless en Vercel Functions (token de Airtable nunca expuesto)
- Backing store: Airtable

## Arquitectura

```
┌──────────────┐   GET /api/records   ┌──────────────────┐
│  index.html  │ ───────────────────► │ Vercel Function  │ ──► Airtable
│  (browser)   │   POST /api/add      │  (server side)   │
└──────────────┘ ───────────────────► └──────────────────┘
                                         ▲
                                         │ AIRTABLE_TOKEN
                                         │ GRUPO_CLAVE
                                       (env vars)
```

El navegador **nunca** ve el token de Airtable ni la clave correcta.
El servidor valida la clave antes de cada inserción.

## Deploy en Vercel (5 minutos)

### 1. Subir a GitHub

```bash
cd eje-austral
git init
git add .
git commit -m "Eje Austral inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/eje-austral.git
git push -u origin main
```

### 2. Regenerar el token de Airtable

Importante: si tenías un token antiguo expuesto, **revócalo en**
[airtable.com/create/tokens](https://airtable.com/create/tokens) y crea uno nuevo
con permisos `data.records:read` y `data.records:write` **solo** para la base
del Directorio.

### 3. Conectar Vercel a GitHub

1. Entra a [vercel.com](https://vercel.com) e inicia sesión.
2. Click en **"Add New..."** → **"Project"**.
3. **"Import Git Repository"** y selecciona `eje-austral`.
4. Antes de hacer Deploy, expande **"Environment Variables"** y agrega:

   | Nombre | Valor |
   |---|---|
   | `AIRTABLE_TOKEN` | El token nuevo que generaste |
   | `AIRTABLE_BASE_ID` | `appAI7XSQjwnEJjYj` |
   | `AIRTABLE_TABLE` | `Directorio` |
   | `GRUPO_CLAVE` | `miraflores` (o una más fuerte) |

5. Click **"Deploy"**. En ~40 segundos tienes URL `eje-austral.vercel.app`.

### 4. Probar

- Abre la URL y verifica que el listado carga.
- Click en el botón **+** y prueba agregar un registro con la clave correcta.
- Prueba agregar con clave incorrecta → debe rechazarlo.

## Desarrollo local (opcional)

```bash
npm install -g vercel
cp .env.example .env.local
# Edita .env.local con tus valores reales
vercel dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
eje-austral/
├── index.html          # SPA cliente con Tailwind CDN
├── api/
│   ├── records.js      # GET → lista registros desde Airtable
│   └── add.js          # POST → agrega registro (valida clave)
├── package.json        # mínimo, solo metadata
├── .env.example        # plantilla de variables de entorno
├── .gitignore
└── README.md
```

## Modelo de datos en Airtable

Tabla `Directorio` con campos:

| Campo | Tipo | Obligatorio |
|---|---|---|
| `Nombre` | Single line text | Sí |
| `Especialidad` | Single select (Obra Gruesa, Terminaciones, Instalaciones, Servicios Técnicos, Colegas) | Sí |
| `telefono` | Phone | No |
| `Comentario` | Long text | No |
| `Colega` | Single line text (firma del recomendador) | Sí |

## Seguridad

- Token de Airtable: **solo en variables de entorno de Vercel**, nunca en el HTML.
- Clave de grupo: validada en el servidor (no en el cliente).
- Sanitización HTML en el render para evitar XSS desde campos de Airtable.
- Rate limit: heredado del plan Hobby de Vercel; suficiente para uso interno.

## Costo

Plan Hobby de Vercel (gratuito): 100 GB-hora de funciones serverless al mes.
Para un directorio de uso interno, sobra de largo.

## Mantenimiento

Los administradores con acceso a la base de Airtable pueden:
- Corregir o eliminar registros erróneos directamente desde Airtable
- Cambiar la clave de grupo modificando `GRUPO_CLAVE` en Vercel (Settings → Environment Variables → redeploy)
- Ver logs de uso en el dashboard de Vercel

## Licencia

Uso interno UACh - Red de Titulados Miraflores.
