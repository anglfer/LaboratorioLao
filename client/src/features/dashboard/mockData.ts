/**
 * Archivo para añadir mock data para pruebas y desarrollo
 */

// Datos para dashboard de empleado
export const mockEmpleadoStats = {
  obrasEnProceso: 12,
  muestrasEnLaboratorio: 45,
  presupuestosPendientes: 8,
  informesPorGenerar: 15,
  facturacionPendiente: 250000,
  tiempoPromedioEnsayo: 24,
  eficienciaLaboratorio: 85,
  ventasMes: 500000,
  presupuestosAprobados: 10,
};

export const mockEmpleadoAlertas = [
  {
    id: 1,
    tipo: "critica",
    mensaje: "Hay 3 informes urgentes pendientes por entregar hoy",
    fecha: "Hace 2 horas",
  },
  {
    id: 2,
    tipo: "importante",
    mensaje: "5 muestras de concreto necesitan procesamiento inmediato",
    fecha: "Hace 5 horas",
  },
  {
    id: 3,
    tipo: "info",
    mensaje: "Recordatorio: Reunión de coordinación mañana a las 9:00 AM",
    fecha: "Hace 1 día",
  },
];

export const mockPresupuestosRecientes = [
  {
    id: 101,
    claveObra: "TIJ-2025-0054",
    // En lugar de pasar un objeto cliente completo, usamos un string
    cliente: "Constructora del Norte S.A.",
    estado: "enviado",
    total: 35250.75,
    fechaSolicitud: "25/06/2025",
  },
  {
    id: 102,
    claveObra: "MXL-2025-0087",
    cliente: "Inmobiliaria Cortés",
    estado: "aprobado",
    total: 84750.0,
    fechaSolicitud: "24/06/2025",
  },
  {
    id: 103,
    claveObra: "ENS-2025-0023",
    cliente: "Municipio de Ensenada",
    estado: "borrador",
    total: 12680.5,
    fechaSolicitud: "23/06/2025",
  },
  {
    id: 104,
    claveObra: "TEC-2025-0015",
    cliente: "Universidad Autónoma de BC",
    estado: "rechazado",
    total: 29750.0,
    fechaSolicitud: "22/06/2025",
  },
];

// Datos para dashboard de brigadista
export const mockBrigadistaStats = {
  actividadesHoy: 5,
  actividadesCompletadas: 2,
  actividadesPendientes: 3,
  horasTrabajadasHoy: 5.5,
};

export const mockBrigadistaActividades = [
  {
    id: 201,
    obraClave: "TIJ-2025-0054",
    ubicacion: "Zona Río, Tijuana",
    tipoActividad: "Recolección de muestras de concreto",
    horaInicio: "09:00",
    horaFin: "10:30",
    estado: "completada",
    prioridad: "alta",
    observaciones: "Se tomaron 5 muestras para ensayo de compresión",
  },
  {
    id: 202,
    obraClave: "TIJ-2025-0062",
    ubicacion: "Otay, Tijuana",
    tipoActividad: "Ensayo CBR in-situ",
    horaInicio: "11:00",
    horaFin: "12:45",
    estado: "completada",
    prioridad: "media",
    observaciones: null,
  },
  {
    id: 203,
    obraClave: "MXL-2025-0087",
    ubicacion: "Zona Centro, Mexicali",
    tipoActividad: "Verificación de compactación",
    horaInicio: "14:00",
    estado: "en_proceso",
    prioridad: "alta",
    observaciones: null,
  },
  {
    id: 204,
    obraClave: "TIJ-2025-0054",
    ubicacion: "Zona Río, Tijuana",
    tipoActividad: "Recolección de muestras de asfalto",
    horaInicio: "16:00",
    estado: "pendiente",
    prioridad: "media",
    observaciones: "Solicitar acceso con supervisor de obra",
  },
  {
    id: 205,
    obraClave: "ENS-2025-0023",
    ubicacion: "Valle de Guadalupe, Ensenada",
    tipoActividad: "Estudio de suelos",
    horaInicio: "17:30",
    estado: "pendiente",
    prioridad: "baja",
    observaciones: null,
  },
];
