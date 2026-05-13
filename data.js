// CONFIGURACIÓN DE DATOS (data.js)

// 1. Datos locales (estos aparecerán si Airtable falla o mientras terminas la conexión)
const DATOS_LOCALES = [
    {
      fields: {
        Nombre: "Cuadrilla de Don Lucho",
        Especialidad: "Terminaciones",
        Telefono: "+56988706612",
        Comentario: "Trae 4 maestros. Trabajo prolijo en encuentros. Recomendado en Osorno.",
        Colega: "Andrés Oyarzún"
      }
    },
    {
      fields: {
        Nombre: "ElectroAustral Ingeniería",
        Especialidad: "Instalaciones",
        Telefono: "+56973059921",
        Comentario: "TE-1 vigente. Entrega firmas en 48h. Muy profesional.",
        Colega: "Daniela Villarroel"
      }
    },
    {
        fields: {
          Nombre: "Manuel Cheuquemán",
          Especialidad: "Terminaciones",
          Telefono: "+56966771183",
          Comentario: "Excelente en porcelanato y cornisas. Puerto Varas/Osorno.",
          Colega: "Camila Cárdenas"
        }
      }
];

// 2. Función para obtener datos (Conecta con Vercel + Airtable)
async function obtenerProveedores() {
  try {
    const response = await fetch('/api/records');
    if (!response.ok) throw new Error("No se pudo conectar a la API");
    const data = await response.json();
    return data.records && data.records.length > 0 ? data.records : DATOS_LOCALES;
  } catch (error) {
    console.warn("Usando datos locales de respaldo:", error);
    return DATOS_LOCALES; // Si falla la API, muestra los datos que pusimos arriba
  }
}

// 3. Función para agregar nuevo proveedor
async function agregarProveedor(registro) {
  try {
    const response = await fetch('/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    });
    return response.ok;
  } catch (error) {
    console.error("Error al guardar:", error);
    return false;
  }
}
    
 
