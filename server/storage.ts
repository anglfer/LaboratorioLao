
import { prisma } from "./prisma";
import type {
  Area,
  Cliente,
  Telefono,
  Correo,
  Obra,
  Presupuesto,
  PresupuestoDetalle,
  Prisma,
  ConceptosJerarquicos,
  AreasJerarquicas,
} from "../generated/prisma";

// Clientes con contactos (full)
async function getAllClientesFull(): Promise<ClienteWithContacts[]> {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        telefonos: true,
        correos: true,
      },
      orderBy: { fechaRegistro: "desc" },
    });
    return clientes;
  } catch (error) {
    console.error("[getAllClientesFull] Error al obtener clientes:", error);
    throw error;
  }
}

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
  usuario: true,
    detalles: {
      include: {
        concepto: true;
      };
    };
  };
}>;

// Areas
async function getAllAreas() {
  return await prisma.area.findMany({
    orderBy: { codigo: "asc" },
  });
}

async function getAreaById(codigo: string) {
  return await prisma.area.findUnique({
    where: { codigo },
    include: {
      obras: true,
    },
  });
}

async function createArea(data: { codigo: string; nombre?: string }) {
  return await prisma.area.create({
    data,
  });
}

async function updateArea(codigo: string, data: { nombre?: string }) {
  return await prisma.area.update({
    where: { codigo },
    data,
  });
}

async function deleteArea(codigo: string): Promise<void> {
  await prisma.area.delete({
    where: { codigo },
  });
}

// Clientes
async function getAllClientes(): Promise<ClienteWithContacts[]> {
  return await prisma.cliente.findMany({
    include: {
      telefonos: true,
      correos: true,
    },
    orderBy: { fechaRegistro: "desc" },
  });
}

async function getClienteById(id: number): Promise<ClienteWithContacts | null> {
  return await prisma.cliente.findUnique({
    where: { id },
    include: {
      telefonos: true,
      correos: true,
    },
  });
}


// Permite crear cliente con telefonos y correos
async function createCliente(data: {
  nombre: string;
  direccion?: string;
  activo?: boolean;
  telefonos?: { telefono: string }[];
  correos?: { correo: string }[];
}): Promise<ClienteWithContacts> {
  const { telefonos, correos, ...clienteData } = data;
  return await prisma.cliente.create({
    data: {
      ...clienteData,
      telefonos: telefonos && telefonos.length > 0 ? {
        create: telefonos.map(t => ({ telefono: t.telefono }))
      } : undefined,
      correos: correos && correos.length > 0 ? {
        create: correos.map(c => ({ correo: c.correo }))
      } : undefined,
    },
    include: {
      telefonos: true,
      correos: true,
    }
  });
}


// Permite actualizar cliente y reemplazar telefonos/correos
async function updateCliente(
  id: number,
  data: {
    nombre?: string;
    direccion?: string;
    activo?: boolean;
    telefonos?: { telefono: string }[];
    correos?: { correo: string }[];
  },
): Promise<ClienteWithContacts> {
  const { telefonos, correos, ...clienteData } = data;
  // Borra los teléfonos y correos existentes y crea los nuevos
  await prisma.telefono.deleteMany({ where: { clienteId: id } });
  await prisma.correo.deleteMany({ where: { clienteId: id } });
  return await prisma.cliente.update({
    where: { id },
    data: {
      ...clienteData,
      telefonos: telefonos && telefonos.length > 0 ? {
        create: telefonos.map(t => ({ telefono: t.telefono }))
      } : undefined,
      correos: correos && correos.length > 0 ? {
        create: correos.map(c => ({ correo: c.correo }))
      } : undefined,
    },
    include: {
      telefonos: true,
      correos: true,
    }
  });
}

async function deleteCliente(id: number): Promise<void> {
  await prisma.cliente.delete({
    where: { id },
  });
}

// Telefonos
async function createTelefono(data: {
  clienteId: number;
  telefono: string;
}): Promise<Telefono> {
  return await prisma.telefono.create({
    data,
  });
}

async function deleteTelefono(id: number): Promise<void> {
  await prisma.telefono.delete({
    where: { id },
  });
}

// Correos
async function createCorreo(data: {
  clienteId: number;
  correo: string;
}): Promise<Correo> {
  return await prisma.correo.create({
    data,
  });
}

async function deleteCorreo(id: number): Promise<void> {
  await prisma.correo.delete({
    where: { id },
  });
}

// Obras
async function getAllObras() {
  return await prisma.obra.findMany({
    include: {
      area: true,
      presupuestos: true,
    },
    orderBy: { clave: "desc" },
  });
}

async function getObrasByArea(areaCodigo: string) {
  return await prisma.obra.findMany({
    where: { areaCodigo },
    include: {
      area: true,
      presupuestos: true,
    },
    orderBy: { clave: "desc" },
  });
}

async function getObraById(clave: string) {
  return await prisma.obra.findUnique({
    where: { clave },
    include: {
      area: true,
      presupuestos: true,
    },
  });
}

async function createObra(data: {
  clave: string;
  areaCodigo: string;
  contratista?: string;
  estado?: number;
}): Promise<Obra> {
  return await prisma.obra.create({
    data,
  });
}

async function updateObra(
  clave: string,
  data: {
    areaCodigo?: string;
    contratista?: string;
    estado?: number;
  },
): Promise<Obra> {
  return await prisma.obra.update({
    where: { clave },
    data,
  });
}

async function deleteObra(clave: string): Promise<void> {
  await prisma.obra.delete({
    where: { clave },
  });
}

// Presupuestos
async function getAllPresupuestos(): Promise<PresupuestoWithDetails[]> {
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
      usuario: true,
      detalles: {
        include: {
          concepto: true,
        },
      },
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

async function getPresupuestoById(id: number): Promise<PresupuestoWithDetails | null> {
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
  usuario: true,
      detalles: {
        include: {
          concepto: true,
        },
      },
    },
  });
}

async function getPresupuestosByObra(claveObra: string) {
  return await prisma.presupuesto.findMany({
    where: { claveObra },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
  cliente: true,
  usuario: true,
      detalles: true,
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

async function getPresupuestosAprobados() {
  return await prisma.presupuesto.findMany({
    where: { estado: "aprobado" },
    include: {
      obra: {
        include: {
          area: true,
        },
      },
  cliente: true,
  usuario: true,
      detalles: true,
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

async function getPresupuestosByUsuario(usuarioId: number): Promise<PresupuestoWithDetails[]> {
  return await prisma.presupuesto.findMany({
    where: { usuarioId },
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
      usuario: true,
      detalles: {
        include: { concepto: true },
      },
    },
    orderBy: { fechaSolicitud: "desc" },
  });
}

async function createPresupuesto(data: {
  clienteId?: number;
  claveObra?: string;
  fechaSolicitud?: Date;
  nombreContratista?: string;
  contactoResponsable?: string;
  direccion?: string;
  descripcionObra?: string;
  alcance?: string;
  subtotal?: number;
  iva?: number;
  ivaMonto?: number;
  total?: number;
  estado?: any;
  manejaAnticipo?: boolean;
  porcentajeAnticipo?: number;
  montoAnticipo?: number;
  usuarioId?: number;
}): Promise<Presupuesto> {
  return await prisma.presupuesto.create({
    data: {
      ...data,
      fechaSolicitud: data.fechaSolicitud || new Date(),
      estado: data.estado || "borrador",
    },
  });
}

async function updatePresupuesto(
  id: number,
  data: Partial<{
    clienteId: number;
    claveObra: string;
    fechaSolicitud: Date;
    nombreContratista: string;
    contactoResponsable: string;
    direccion: string;
    descripcionObra: string;
    alcance: string;
    subtotal: number;
    iva: number;
    ivaMonto: number;
    total: number;
    estado: any;
    manejaAnticipo: boolean;
    porcentajeAnticipo: number;
    montoAnticipo: number;
  }>,
): Promise<Presupuesto> {
  return await prisma.presupuesto.update({
    where: { id },
    data,
  });
}

async function deletePresupuesto(id: number): Promise<void> {
  await prisma.presupuesto.delete({
    where: { id },
  });
}

// Presupuesto Detalles
async function getPresupuestoDetalles(presupuestoId: number) {
  return await prisma.presupuestoDetalle.findMany({
    where: { presupuestoId },
    include: {
      concepto: true,
    },
    orderBy: { id: "asc" },
  });
}

async function createPresupuestoDetalle(data: {
  presupuestoId: number;
  conceptoCodigo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
  estado?: any;
}): Promise<PresupuestoDetalle> {
  return await prisma.presupuestoDetalle.create({
    data: {
      ...data,
      subtotal: data.subtotal || data.cantidad * data.precioUnitario,
      estado: data.estado || "en_proceso",
    },
  });
}

async function updatePresupuestoDetalle(
  id: number,
  data: Partial<{
    conceptoCodigo: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    estado: any;
  }>,
): Promise<PresupuestoDetalle> {
  return await prisma.presupuestoDetalle.update({
    where: { id },
    data,
  });
}

async function deletePresupuestoDetalle(id: number): Promise<void> {
  await prisma.presupuestoDetalle.delete({
    where: { id },
  });
}

async function deletePresupuestoDetallesByPresupuestoId(presupuestoId: number): Promise<void> {
  await prisma.presupuestoDetalle.deleteMany({
    where: { presupuestoId },
  });
}

// Utilidades
async function recalcularTotalesPresupuesto(presupuestoId: number): Promise<void> {
  // Obtener todos los detalles del presupuesto
  const detalles = await prisma.presupuestoDetalle.findMany({
    where: { presupuestoId },
  });

  // Calcular subtotal
  const subtotal = detalles.reduce(
    (total, detalle) =>
      total + Number(detalle.precioUnitario) * Number(detalle.cantidad),
    0,
  );

  // Obtener el presupuesto para el IVA
  const presupuestoData = await prisma.presupuesto.findUnique({
    where: { id: presupuestoId },
  });

  const iva = Number(presupuestoData?.iva) || 0.16;
  const ivaMonto = subtotal * iva;
  const total = subtotal + ivaMonto;

  // Actualizar el presupuesto
  await prisma.presupuesto.update({
    where: { id: presupuestoId },
    data: {
      subtotal,
      ivaMonto,
      total,
    },
  });
}

async function generateClaveObra(areaCodigo: string): Promise<string> {
  try {
    console.log(`[Storage] Generando clave para área: ${areaCodigo}`);

    // Verificar que el área existe
    const area = await prisma.area.findUnique({
      where: { codigo: areaCodigo },
    });

    if (!area) {
      throw new Error(`Área con código ${areaCodigo} no encontrada`);
    }

  // Obtener año actual en 2 dígitos (requerimiento nuevo: area-YY-XXX)
  const fullYear = new Date().getFullYear();
  const shortYear = (fullYear % 100).toString().padStart(2, "0");
  console.log(`[Storage] Año actual (full/short): ${fullYear}/${shortYear}`);

  // Prefijo nuevo (antes: area-YYYY-####) ahora: area-YY-XXX
  const prefix = `${areaCodigo}-${shortYear}-`;
  console.log(`[Storage] Buscando obras con nuevo prefijo: ${prefix}`);

    const existingObras = await prisma.obra.findMany({
      where: {
        areaCodigo: areaCodigo,
        clave: {
          startsWith: prefix,
        },
      },
      select: {
        clave: true,
      },
      orderBy: {
        clave: "desc",
      },
    });

    console.log(
      `[Storage] Obras encontradas: ${existingObras.length}`,
      existingObras.map((o) => o.clave),
    );

    // Obtener el número más alto usado
    let maxNumber = 0;
    for (const obra of existingObras) {
      const numberPart = obra.clave.replace(prefix, "");
      const number = parseInt(numberPart, 10);
      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }

    console.log(`[Storage] Número máximo encontrado: ${maxNumber}`);

    // Generar el siguiente número con 3 dígitos (reinicia por año y área)
    const nextNumber = maxNumber + 1;
    const claveObra = `${areaCodigo}-${shortYear}-${nextNumber
      .toString()
      .padStart(3, "0")}`;

    // Nota: coexistirán claves antiguas (area-YYYY-####) y nuevas (area-YY-XXX).
    // Si se requiere migración, crear script separado para convertir históricos.

    console.log(`[Storage] Nueva clave generada: ${claveObra}`);

    // Verificar que la clave no existe (doble verificación)
    const existingObra = await prisma.obra.findUnique({
      where: { clave: claveObra },
    });

    if (existingObra) {
      throw new Error(`La clave ${claveObra} ya existe en la base de datos`);
    }

    return claveObra;
  } catch (error) {
    console.error("[Storage] Error generando clave de obra:", error);
    throw error;
  }
}

// Dashboard
async function getDashboardStats() {
  const [clientesCount, presupuestosCount, obrasCount] = await Promise.all([
    prisma.cliente.count(),
    prisma.presupuesto.count(),
    prisma.obra.count(),
  ]);

  return {
    totalClientes: clientesCount,
    totalPresupuestos: presupuestosCount,
    totalObras: obrasCount,
  };
}

async function getQuickStats() {
  const [
    totalClientes,
    totalPresupuestos,
    presupuestosAprobados,
    totalObras,
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.presupuesto.count(),
    prisma.presupuesto.count({ where: { estado: "aprobado" } }),
    prisma.obra.count(),
  ]);

  return {
    totalClientes,
    totalPresupuestos,
    presupuestosAprobados,
    totalObras,
  };
}

// Export as default object
const storage = {
  // Clientes Full
  getAllClientesFull,
  // Areas
  getAllAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,

  // Clientes
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,

  // Telefonos
  createTelefono,
  deleteTelefono,

  // Correos
  createCorreo,
  deleteCorreo,

  // Obras
  getAllObras,
  getObrasByArea,
  getObraById,
  createObra,
  updateObra,
  deleteObra,

  // Presupuestos
  getAllPresupuestos,
  getPresupuestoById,
  getPresupuestosByObra,
  getPresupuestosAprobados,
  getPresupuestosByUsuario,
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
  
  // Dashboard
  getDashboardStats,
  getQuickStats,
};

export default storage;
