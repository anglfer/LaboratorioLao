import { prisma } from "./prisma";
import type {
  Area,
  Subarea,
  Concepto,
  Cliente,
  Telefono,
  Correo,
  Obra,
  Presupuesto,
  PresupuestoDetalle,
  Programacion,
  Brigadista,
  Vehiculo,
  Prisma,
} from "../generated/prisma";

// Define types for includes
type ClienteWithContacts = Prisma.ClienteGetPayload<{
  include: {
    telefonos: true;
    correos: true;
  };
}>;

type PresupuestoWithDetails = Prisma.PresupuestoGetPayload<{
  include: {
    obra: {
      include: {
        area: true;
      };
    };
    cliente: {
      include: {
        telefonos: true;
        correos: true;
      };
    };
    detalles: {
      include: {
        concepto: {
          include: {
            subarea: {
              include: {
                area: true;
              };
            };
          };
        };
      };
    };
  };
}>;

// Areas
export async function getAllAreas(): Promise<Area[]> {
  return await prisma.area.findMany({
    orderBy: { nombre: "asc" },
  });
}

export async function createArea(data: {
  codigo: string;
  nombre?: string;
}): Promise<Area> {
  return await prisma.area.create({
    data,
  });
}

export async function updateArea(
  codigo: string,
  data: { nombre?: string },
): Promise<Area> {
  return await prisma.area.update({
    where: { codigo },
    data,
  });
}

export async function deleteArea(codigo: string): Promise<void> {
  await prisma.area.delete({
    where: { codigo },
  });
}

// Subareas
export async function getAllSubareas() {
  return await prisma.subarea.findMany({
    include: {
      area: true,
    },
    orderBy: { nombre: "asc" },
  });
}

export async function getSubareasByArea(areaCodigo: string) {
  return await prisma.subarea.findMany({
    where: { areaCodigo },
    include: {
      area: true,
    },
    orderBy: { nombre: "asc" },
  });
}

export async function createSubarea(data: {
  nombre?: string;
  areaCodigo?: string;
}) {
  return await prisma.subarea.create({
    data,
    include: {
      area: true,
    },
  });
}

export async function updateSubarea(
  id: number,
  data: { nombre?: string; areaCodigo?: string },
) {
  return await prisma.subarea.update({
    where: { id },
    data,
    include: {
      area: true,
    },
  });
}

export async function deleteSubarea(id: number): Promise<void> {
  await prisma.subarea.delete({
    where: { id },
  });
}

// Conceptos
export async function getAllConceptos() {
  return await prisma.concepto.findMany({
    include: {
      subarea: {
        include: {
          area: true,
        },
      },
    },
    orderBy: { codigo: "asc" },
  });
}

export async function getConceptosBySubarea(subareaId: number) {
  return await prisma.concepto.findMany({
    where: { subareaId },
    include: {
      subarea: {
        include: {
          area: true,
        },
      },
    },
    orderBy: { codigo: "asc" },
  });
}

export async function createConcepto(data: {
  codigo: string;
  subareaId?: number;
  descripcion?: string;
  unidad?: string;
  p_u?: number;
}) {
  return await prisma.concepto.create({
    data,
    include: {
      subarea: {
        include: {
          area: true,
        },
      },
    },
  });
}

export async function updateConcepto(
  codigo: string,
  data: {
    subareaId?: number;
    descripcion?: string;
    unidad?: string;
    p_u?: number;
  },
) {
  return await prisma.concepto.update({
    where: { codigo },
    data,
    include: {
      subarea: {
        include: {
          area: true,
        },
      },
    },
  });
}

export async function deleteConcepto(codigo: string): Promise<void> {
  await prisma.concepto.delete({
    where: { codigo },
  });
}

// Clientes
export async function getAllClientes(): Promise<ClienteWithContacts[]> {
  return await prisma.cliente.findMany({
    include: {
      telefonos: true,
      correos: true,
    },
    orderBy: { nombre: "asc" },
  });
}

export async function getClienteById(
  id: number,
): Promise<ClienteWithContacts | null> {
  return await prisma.cliente.findUnique({
    where: { id },
    include: {
      telefonos: true,
      correos: true,
    },
  });
}

export async function createCliente(data: {
  nombre?: string;
  direccion?: string;
  fechaRegistro?: Date;
  activo?: boolean;
}): Promise<Cliente> {
  return await prisma.cliente.create({
    data: {
      ...data,
      fechaRegistro: data.fechaRegistro || new Date(),
    },
  });
}

export async function updateCliente(
  id: number,
  data: {
    nombre?: string;
    direccion?: string;
    activo?: boolean;
  },
): Promise<Cliente> {
  return await prisma.cliente.update({
    where: { id },
    data,
  });
}

export async function deleteCliente(id: number): Promise<void> {
  await prisma.cliente.delete({
    where: { id },
  });
}

// Teléfonos
export async function createTelefono(data: {
  clienteId: number;
  telefono: string;
}): Promise<Telefono> {
  return await prisma.telefono.create({
    data,
  });
}

export async function updateTelefono(
  id: number,
  data: { clienteId?: number; telefono?: string },
): Promise<Telefono> {
  return await prisma.telefono.update({
    where: { id },
    data,
  });
}

export async function deleteTelefono(id: number): Promise<void> {
  await prisma.telefono.delete({
    where: { id },
  });
}

// Correos
export async function createCorreo(data: {
  clienteId: number;
  correo: string;
}): Promise<Correo> {
  return await prisma.correo.create({
    data,
  });
}

export async function updateCorreo(
  id: number,
  data: { clienteId?: number; correo?: string },
): Promise<Correo> {
  return await prisma.correo.update({
    where: { id },
    data,
  });
}

export async function deleteCorreo(id: number): Promise<void> {
  await prisma.correo.delete({
    where: { id },
  });
}

// Obras
export async function getAllObras() {
  return await prisma.obra.findMany({
    include: {
      area: true,
    },
    orderBy: { clave: "desc" },
  });
}

export async function getObraById(clave: string) {
  return await prisma.obra.findUnique({
    where: { clave },
    include: {
      area: true,
    },
  });
}

export async function getObrasByArea(areaCodigo: string) {
  return await prisma.obra.findMany({
    where: { areaCodigo },
    include: {
      area: true,
    },
    orderBy: { clave: "desc" },
  });
}

export async function createObra(data: {
  clave: string;
  areaCodigo: string;
  contratista?: string;
  estado?: number;
}): Promise<Obra> {
  return await prisma.obra.create({
    data,
    include: {
      area: true,
    },
  });
}

export async function updateObra(
  clave: string,
  data: {
    contratista?: string;
    estado?: number;
  },
): Promise<Obra> {
  return await prisma.obra.update({
    where: { clave },
    data,
    include: {
      area: true,
    },
  });
}

export async function deleteObra(clave: string): Promise<void> {
  await prisma.obra.delete({
    where: { clave },
  });
}

// Presupuestos
export async function getAllPresupuestos() {
  return await prisma.presupuesto.findMany({
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      cliente: {
        include: {
          telefonos: true,
          correos: true,
        },
      },
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

export async function getPresupuestoById(
  id: number,
): Promise<PresupuestoWithDetails | null> {
  return await prisma.presupuesto.findUnique({
    where: { id },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      cliente: {
        include: {
          telefonos: true,
          correos: true,
        },
      },
      detalles: {
        include: {
          concepto: {
            include: {
              subarea: {
                include: {
                  area: true,
                },
              },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
  });
}

export async function getPresupuestosByObra(claveObra: string) {
  return await prisma.presupuesto.findMany({
    where: { claveObra },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      cliente: {
        include: {
          telefonos: true,
          correos: true,
        },
      },
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

export async function getPresupuestosAprobados() {
  return await prisma.presupuesto.findMany({
    where: {
      estado: "aprobado",
    },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      cliente: {
        include: {
          telefonos: true,
          correos: true,
        },
      },
      detalles: {
        include: {
          concepto: {
            include: {
              subarea: {
                include: {
                  area: true,
                },
              },
            },
          },
        },
        orderBy: { id: "asc" },
      },
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

export async function createPresupuesto(data: {
  claveObra?: string;
  clienteId?: number;
  nombreContratista?: string;
  descripcionObra?: string;
  tramo?: string;
  colonia?: string;
  calle?: string;
  contactoResponsable?: string;
  formaPago?: string;
  iva?: number;
  estado?: any;
  fechaInicio?: Date;
}): Promise<Presupuesto> {
  return await prisma.presupuesto.create({
    data: {
      ...data,
      fechaSolicitud: new Date(),
    },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      cliente: true,
    },
  });
}

export async function updatePresupuesto(
  id: number,
  data: {
    claveObra?: string;
    clienteId?: number;
    nombreContratista?: string;
    descripcionObra?: string;
    tramo?: string;
    colonia?: string;
    calle?: string;
    contactoResponsable?: string;
    formaPago?: string;
    iva?: number;
    subtotal?: number;
    ivaMonto?: number;
    total?: number;
    estado?: any;
    fechaInicio?: Date;
    razonRechazo?: string;
  },
): Promise<Presupuesto> {
  return await prisma.presupuesto.update({
    where: { id },
    data,
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      cliente: true,
    },
  });
}

export async function deletePresupuesto(id: number): Promise<void> {
  await prisma.presupuesto.delete({
    where: { id },
  });
}

// Presupuesto Detalles
export async function getPresupuestoDetalles(presupuestoId: number) {
  return await prisma.presupuestoDetalle.findMany({
    where: { presupuestoId },
    include: {
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });
}

export async function createPresupuestoDetalle(data: {
  presupuestoId: number;
  conceptoCodigo: string;
  cantidad?: number;
  precioUnitario: number;
  subtotal?: number;
  estado?: any;
}) {
  return await prisma.presupuestoDetalle.create({
    data,
    include: {
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
    },
  });
}

export async function updatePresupuestoDetalle(
  id: number,
  data: {
    conceptoCodigo?: string;
    cantidad?: number;
    precioUnitario?: number;
    subtotal?: number;
    estado?: any;
  },
) {
  return await prisma.presupuestoDetalle.update({
    where: { id },
    data,
    include: {
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
    },
  });
}

export async function deletePresupuestoDetalle(id: number): Promise<void> {
  await prisma.presupuestoDetalle.delete({
    where: { id },
  });
}

export async function deletePresupuestoDetallesByPresupuestoId(
  presupuestoId: number,
): Promise<void> {
  await prisma.presupuestoDetalle.deleteMany({
    where: { presupuestoId },
  });
}

// Función auxiliar para calcular totales de presupuesto
export async function recalcularTotalesPresupuesto(
  presupuestoId: number,
): Promise<Presupuesto> {
  const detalles = await prisma.presupuestoDetalle.findMany({
    where: { presupuestoId },
  });

  const subtotal = detalles.reduce((sum, detalle) => {
    const subtotalDetalle = detalle.subtotal ? Number(detalle.subtotal) : 0;
    return sum + subtotalDetalle;
  }, 0);

  const presupuesto = await prisma.presupuesto.findUnique({
    where: { id: presupuestoId },
  });

  if (!presupuesto) {
    throw new Error("Presupuesto no encontrado");
  }

  const ivaPorcentaje = presupuesto.iva ? Number(presupuesto.iva) : 0;
  const ivaMonto = subtotal * ivaPorcentaje;
  const total = subtotal + ivaMonto;

  return await prisma.presupuesto.update({
    where: { id: presupuestoId },
    data: {
      subtotal,
      ivaMonto,
      total,
    },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      cliente: true,
    },
  });
}

// Función para generar clave de obra automática
export async function generateClaveObra(areaCodigo: string): Promise<string> {
  const año = new Date().getFullYear();

  // Buscar o crear contador para el área y año
  let contador = await prisma.contadorObras.findUnique({
    where: {
      areaCodigo_año: {
        areaCodigo,
        año,
      },
    },
  });

  if (!contador) {
    // Crear nuevo contador si no existe
    contador = await prisma.contadorObras.create({
      data: {
        areaCodigo,
        año,
        contador: 1,
      },
    });
  } else {
    // Incrementar contador existente
    contador = await prisma.contadorObras.update({
      where: {
        areaCodigo_año: {
          areaCodigo,
          año,
        },
      },
      data: {
        contador: (contador.contador || 0) + 1,
      },
    });
  }

  // Formatear clave: [ÁREA]-[YY]-[001] (código en mayúsculas, año con 2 dígitos)
  const claveObra = `${areaCodigo.toUpperCase()}-${año.toString().slice(-2)}-${String(contador.contador).padStart(3, "0")}`;

  // Crear la obra
  await prisma.obra.create({
    data: {
      clave: claveObra,
      areaCodigo,
      estado: 1,
    },
  });

  return claveObra;
}

// Brigadistas
export async function getAllBrigadistas() {
  return await prisma.brigadista.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getBrigadistasDisponibles(fecha?: string, hora?: string) {
  const fechaConsulta = fecha ? new Date(fecha) : new Date();

  // Obtener todos los brigadistas activos
  const todosBrigadistas = await prisma.brigadista.findMany({
    where: { activo: true },
    orderBy: { nombre: "asc" },
  });

  if (!fecha || !hora) {
    // Si no se especifica fecha/hora, devolver todos los activos
    return todosBrigadistas;
  }

  // Obtener programaciones en la fecha y hora especificada
  const programacionesOcupadas = await prisma.programacion.findMany({
    where: {
      fechaProgramada: fechaConsulta,
      horaProgramada: hora,
      estado: {
        in: ["programada", "en_proceso"],
      },
    },
    select: {
      brigadistaId: true,
      brigadistaApoyoId: true,
    },
  });

  // Extraer IDs de brigadistas ocupados
  const brigadistasOcupados = new Set([
    ...programacionesOcupadas.map((p) => p.brigadistaId),
    ...programacionesOcupadas.map((p) => p.brigadistaApoyoId).filter(Boolean),
  ]);

  // Filtrar brigadistas disponibles
  return todosBrigadistas.filter(
    (brigadista) => !brigadistasOcupados.has(brigadista.id),
  );
}

export async function getBrigadistaById(id: number) {
  return await prisma.brigadista.findUnique({
    where: { id },
  });
}

// Vehículos
export async function getAllVehiculos() {
  return await prisma.vehiculo.findMany({
    where: { activo: true },
    orderBy: { descripcion: "asc" },
  });
}

export async function getVehiculosDisponibles(fecha?: string, hora?: string) {
  const fechaConsulta = fecha ? new Date(fecha) : new Date();

  // Obtener todos los vehículos activos
  const todosVehiculos = await prisma.vehiculo.findMany({
    where: { activo: true },
    orderBy: { descripcion: "asc" },
  });

  if (!fecha || !hora) {
    // Si no se especifica fecha/hora, devolver todos los activos
    return todosVehiculos;
  }

  // Obtener programaciones en la fecha y hora especificada
  const programacionesOcupadas = await prisma.programacion.findMany({
    where: {
      fechaProgramada: fechaConsulta,
      horaProgramada: hora,
      estado: {
        in: ["programada", "en_proceso"],
      },
    },
    select: {
      vehiculoId: true,
    },
  });

  // Extraer IDs de vehículos ocupados
  const vehiculosOcupados = new Set(
    programacionesOcupadas.map((p) => p.vehiculoId),
  );

  // Filtrar vehículos disponibles
  return todosVehiculos.filter(
    (vehiculo) => !vehiculosOcupados.has(vehiculo.id),
  );
}

export async function getVehiculoById(id: number) {
  return await prisma.vehiculo.findUnique({
    where: { id },
  });
}

// Programaciones
export async function getAllProgramaciones(filters?: {
  fechaDesde?: string;
  fechaHasta?: string;
  brigadistaId?: number;
  estado?: string;
  claveObra?: string;
}) {
  const where: any = {};

  if (filters?.fechaDesde) {
    where.fechaProgramada = {
      gte: new Date(filters.fechaDesde),
    };
  }

  if (filters?.fechaHasta) {
    where.fechaProgramada = {
      ...where.fechaProgramada,
      lte: new Date(filters.fechaHasta),
    };
  }

  if (filters?.brigadistaId) {
    where.brigadistaId = filters.brigadistaId;
  }

  if (filters?.estado) {
    where.estado = filters.estado;
  }

  if (filters?.claveObra) {
    where.claveObra = filters.claveObra;
  }

  return await prisma.programacion.findMany({
    where,
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
    orderBy: [{ fechaProgramada: "asc" }, { horaProgramada: "asc" }],
  });
}

export async function getProgramacionById(id: number) {
  return await prisma.programacion.findUnique({
    where: { id },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
  });
}

export async function createProgramacion(data: {
  claveObra: string;
  fechaProgramada: Date;
  horaProgramada: string;
  tipoProgramacion: any;
  nombreResidente?: string;
  telefonoResidente?: string;
  conceptoCodigo: string;
  cantidadMuestras: number;
  tipoRecoleccion: any;
  brigadistaId: number;
  brigadistaApoyoId?: number;
  vehiculoId: number;
  claveEquipo?: string;
  observaciones?: string;
  instrucciones?: string;
  condicionesEspeciales?: string;
}) {
  return await prisma.programacion.create({
    data,
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
  });
}

export async function updateProgramacion(id: number, data: any) {
  return await prisma.programacion.update({
    where: { id },
    data,
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
  });
}

export async function deleteProgramacion(id: number) {
  await prisma.programacion.delete({
    where: { id },
  });
}

export async function getProgramacionesByBrigadista(
  brigadistaId: number,
  filters?: { fechaDesde?: string; fechaHasta?: string; estado?: string },
) {
  const where: any = { brigadistaId };

  if (filters?.fechaDesde && filters?.fechaHasta) {
    where.fechaProgramada = {
      gte: new Date(filters.fechaDesde),
      lte: new Date(filters.fechaHasta),
    };
  } else if (filters?.fechaDesde) {
    where.fechaProgramada = {
      gte: new Date(filters.fechaDesde),
    };
  } else if (filters?.fechaHasta) {
    where.fechaProgramada = {
      lte: new Date(filters.fechaHasta),
    };
  }

  if (filters?.estado) {
    where.estado = filters.estado;
  }

  return await prisma.programacion.findMany({
    where,
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
    orderBy: [{ fechaProgramada: "asc" }, { horaProgramada: "asc" }],
  });
}

// Acciones de programación
export async function iniciarProgramacion(
  id: number,
  data: {
    muestrasObtenidas?: number;
    fechaInicio?: Date;
  },
) {
  return await prisma.programacion.update({
    where: { id },
    data: {
      estado: "en_proceso",
      fechaInicio: data.fechaInicio || new Date(),
      muestrasObtenidas: data.muestrasObtenidas,
    },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
  });
}

export async function completarProgramacion(
  id: number,
  data: {
    muestrasObtenidas: number;
    fechaCompletado?: Date;
    observaciones?: string;
  },
) {
  return await prisma.programacion.update({
    where: { id },
    data: {
      estado: "completada",
      fechaCompletado: data.fechaCompletado || new Date(),
      muestrasObtenidas: data.muestrasObtenidas,
      observaciones: data.observaciones,
    },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
  });
}

export async function cancelarProgramacion(
  id: number,
  data: {
    motivoCancelacion: string;
  },
) {
  return await prisma.programacion.update({
    where: { id },
    data: {
      estado: "cancelada",
      motivoCancelacion: data.motivoCancelacion,
    },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
  });
}

export async function reprogramarProgramacion(
  id: number,
  data: {
    fechaProgramada: Date;
    horaProgramada: string;
    brigadistaId?: number;
    vehiculoId?: number;
    motivoCancelacion?: string;
  },
) {
  return await prisma.programacion.update({
    where: { id },
    data: {
      estado: "reprogramada",
      fechaProgramada: data.fechaProgramada,
      horaProgramada: data.horaProgramada,
      brigadistaId: data.brigadistaId,
      vehiculoId: data.vehiculoId,
      motivoCancelacion: data.motivoCancelacion,
    },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
      concepto: {
        include: {
          subarea: {
            include: {
              area: true,
            },
          },
        },
      },
      brigadista: true,
      brigadistaApoyo: true,
      vehiculo: true,
    },
  });
}

// Dashboard estadísticas
export async function getDashboardStats() {
  // Calcular inicio y fin de la semana actual
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes
  inicioSemana.setHours(0, 0, 0, 0);
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6); // Domingo
  finSemana.setHours(23, 59, 59, 999);

  // Obtener estadísticas de la semana
  const [
    programacionesTotales,
    programacionesCompletadas,
    programacionesPendientes,
    programacionesCanceladas,
    brigadistasActivos,
    vehiculosEnUso
  ] = await Promise.all([
    prisma.programacion.count({
      where: {
        fechaProgramada: { gte: inicioSemana, lte: finSemana },
      },
    }),
    prisma.programacion.count({
      where: {
        estado: "completada",
        fechaProgramada: { gte: inicioSemana, lte: finSemana },
      },
    }),
    prisma.programacion.count({
      where: {
        estado: "programada",
        fechaProgramada: { gte: inicioSemana, lte: finSemana },
      },
    }),
    prisma.programacion.count({
      where: {
        estado: "cancelada",
        fechaProgramada: { gte: inicioSemana, lte: finSemana },
      },
    }),
    prisma.programacion.aggregate({
      where: {
        fechaProgramada: { gte: inicioSemana, lte: finSemana },
      },
      _count: { distinct: true },
      distinct: ['brigadistaId'],
    }).then(r => r._count?.brigadistaId ?? 0),
    prisma.programacion.aggregate({
      where: {
        fechaProgramada: { gte: inicioSemana, lte: finSemana },
      },
      _count: { distinct: true },
      distinct: ['vehiculoId'],
    }).then(r => r._count?.vehiculoId ?? 0),
  ]);

  // Calcular rendimiento semanal
  const rendimientoSemanal = programacionesTotales > 0
    ? (programacionesCompletadas / programacionesTotales) * 100
    : 0;

  return {
    programacionesTotales,
    programacionesCompletadas,
    programacionesPendientes,
    programacionesCanceladas,
    rendimientoSemanal,
    brigadistasActivos,
    vehiculosEnUso,
  };
}

export async function getDashboardGrafica(fechaInicio?: string) {
  // Obtener datos de la semana especificada o la última semana
  let fechaConsulta = new Date();
  if (fechaInicio) {
    fechaConsulta = new Date(fechaInicio);
  }

  const fechaFin = new Date(fechaConsulta);
  fechaFin.setDate(fechaConsulta.getDate() + 6); // 7 días

  const programaciones = await prisma.programacion.findMany({
    where: {
      fechaProgramada: {
        gte: fechaConsulta,
        lte: fechaFin,
      },
    },
    select: {
      fechaProgramada: true,
      estado: true,
    },
  });

  // Agrupar por día de la semana
  const diasSemana = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  const datos = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(fechaConsulta);
    fecha.setDate(fechaConsulta.getDate() + i);
    const diaSemana = diasSemana[fecha.getDay()];

    const programacionesDia = programaciones.filter((p) => {
      const fechaProg = new Date(p.fechaProgramada);
      return fechaProg.toDateString() === fecha.toDateString();
    });

    return {
      dia: diaSemana,
      actividades: programacionesDia.length,
      completadas: programacionesDia.filter((p) => p.estado === "completada")
        .length,
    };
  });

  return datos;
}

export async function getQuickStats() {
  const hoy = new Date();
  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() - hoy.getDay() + 1); // Lunes de esta semana

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6); // Domingo de esta semana

  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [programacionesActivasSemana, actividadesEnProceso, completadasMes] =
    await Promise.all([
      // Programaciones activas esta semana (programadas + en proceso)
      prisma.programacion.count({
        where: {
          fechaProgramada: {
            gte: inicioSemana,
            lte: finSemana,
          },
          estado: {
            in: ["programada", "en_proceso"],
          },
        },
      }),
      // Actividades actualmente en proceso
      prisma.programacion.count({
        where: {
          estado: "en_proceso",
        },
      }),
      // Completadas este mes
      prisma.programacion.count({
        where: {
          estado: "completada",
          fechaCompletado: {
            gte: inicioMes,
          },
        },
      }),
    ]);

  return {
    programacionesActivas: programacionesActivasSemana,
    enProceso: actividadesEnProceso,
    completadasMes: completadasMes,
  };
}

export const storage = {
  // Areas
  getAllAreas,
  createArea,
  updateArea,
  deleteArea,

  // Subareas
  getAllSubareas,
  getSubareasByArea,
  createSubarea,
  updateSubarea,
  deleteSubarea,

  // Conceptos
  getAllConceptos,
  getConceptosBySubarea,
  createConcepto,
  updateConcepto,
  deleteConcepto,

  // Clientes
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,

  // Contactos
  createTelefono,
  updateTelefono,
  deleteTelefono,
  createCorreo,
  updateCorreo,
  deleteCorreo,

  // Obras
  getAllObras,
  getObraById,
  getObrasByArea,
  createObra,
  updateObra,
  deleteObra,

  // Presupuestos
  getAllPresupuestos,
  getPresupuestoById,
  getPresupuestosByObra,
  getPresupuestosAprobados,
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto,

  // Presupuesto Detalles
  getPresupuestoDetalles,
  createPresupuestoDetalle,
  updatePresupuestoDetalle,
  deletePresupuestoDetalle,
  deletePresupuestoDetallesByPresupuestoId,

  // Utilidades
  recalcularTotalesPresupuesto,
  generateClaveObra,
  // Brigadistas
  getAllBrigadistas,
  getBrigadistasDisponibles,
  getBrigadistaById,

  // Vehículos
  getAllVehiculos,
  getVehiculosDisponibles,
  getVehiculoById, // Programaciones
  getAllProgramaciones,
  getProgramacionById,
  createProgramacion,
  updateProgramacion,
  deleteProgramacion,
  getProgramacionesByBrigadista,
  iniciarProgramacion,
  completarProgramacion,
  cancelarProgramacion,
  reprogramarProgramacion, // Dashboard
  getDashboardStats,
  getDashboardGrafica,
  getQuickStats,
};
