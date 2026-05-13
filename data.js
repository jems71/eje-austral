// CONFIGURACIÓN DE DATOS LOCALES PARA OSORNO
window.DATOS_LOCALES = [
  {
    fields: {
      Nombre: "Cuadrilla de Don Lucho",
      Especialidad: "Terminaciones",
      Telefono: "+56988706612",
      Comentario: "Trae 4 maestros + 2 jornales. Trabajo prolijo en encuentros. Recomendado en Osorno.",
      Colega: "Andrés Oyarzún"
    }
  },
  {
    fields: {
      Nombre: "ElectroAustral Ingeniería",
      Especialidad: "Instalaciones",
      Telefono: "+56973059921",
      Comentario: "TE-1 vigente. Entrega TE-1 firmado a las 48h de recepción SEC.",
      Colega: "Daniela Villarroel"
    }
  },
  {
    fields: {
      Nombre: "Manuel Cheuquemán",
      Especialidad: "Terminaciones",
      Telefono: "+56966771183",
      Comentario: "Excelente en porcelanato y cornisas. Pide herramienta propia.",
      Colega: "Camila Cárdenas"
    }
  }
];

// Función para obtener datos (No tocar)
async function obtenerProveedores() {
  try {
    const response = await fetch('/api/records');
    if (!response.ok) throw new Error();
    const data = await response.json();
    return (data.records && data.records.length > 0) ? data.records : window.DATOS_LOCALES;
  } catch (error) {
    return window.DATOS_LOCALES;
  }
}

// Función para agregar datos (No tocar)
async function agregarProveedor(registro) {
  try {
    const response = await fetch('/api/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registro)
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
