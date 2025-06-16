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
  Prisma
} from "../generated/prisma";

// Define types for includes
type ClienteWithContacts = Prisma.ClienteGetPayload<{
  include: {
    telefonos: true;
    correos: true;
  }
}>;

type PresupuestoWithDetails = Prisma.PresupuestoGetPayload<{
  include: {
    obra: {
      include: {
        area: true;
      }
    };
    cliente: {
      include: {
        telefonos: true;
        correos: true;
      }
    };
    detalles: {
      include: {
        concepto: {
          include: {
            subarea: {
              include: {
                area: true;
              }
            }
          }
        }
      }
    }
  }
}>;

// Areas
export async function getAllAreas(): Promise<Area[]> {
  return await prisma.area.findMany({
    orderBy: { nombre: 'asc' }
  });
}

export async function createArea(data: { codigo: string; nombre?: string }): Promise<Area> {
  return await prisma.area.create({
    data
  });
}

export async function updateArea(codigo: string, data: { nombre?: string }): Promise<Area> {
  return await prisma.area.update({
    where: { codigo },
    data
  });
}

export async function deleteArea(codigo: string): Promise<void> {
  await prisma.area.delete({
    where: { codigo }
  });
}

// Subareas
export async function getAllSubareas() {
  return await prisma.subarea.findMany({
    include: {
      area: true
    },
    orderBy: { nombre: 'asc' }
  });
}

export async function getSubareasByArea(areaCodigo: string) {
  return await prisma.subarea.findMany({
    where: { areaCodigo },
    include: {
      area: true
    },
    orderBy: { nombre: 'asc' }
  });
}

export async function createSubarea(data: { nombre?: string; areaCodigo?: string }) {
  return await prisma.subarea.create({
    data,
    include: {
      area: true
    }
  });
}

export async function updateSubarea(id: number, data: { nombre?: string; areaCodigo?: string }) {
  return await prisma.subarea.update({
    where: { id },
    data,
    include: {
      area: true
    }
  });
}

export async function deleteSubarea(id: number): Promise<void> {
  await prisma.subarea.delete({
    where: { id }
  });
}

// Conceptos
export async function getAllConceptos() {
  return await prisma.concepto.findMany({
    include: {
      subarea: {
        include: {
          area: true
        }
      }
    },
    orderBy: { codigo: 'asc' }
  });
}

export async function getConceptosBySubarea(subareaId: number) {
  return await prisma.concepto.findMany({
    where: { subareaId },
    include: {
      subarea: {
        include: {
          area: true
        }
      }
    },
    orderBy: { codigo: 'asc' }
  });
}

export async function createConcepto(data: { 
  codigo: string; 
  subareaId?: number; 
  descripcion?: string; 
  unidad?: string; 
  p_u?: number 
}) {
  return await prisma.concepto.create({
    data,
    include: {
      subarea: {
        include: {
          area: true
        }
      }
    }
  });
}

export async function updateConcepto(codigo: string, data: { 
  subareaId?: number; 
  descripcion?: string; 
  unidad?: string; 
  p_u?: number 
}) {
  return await prisma.concepto.update({
    where: { codigo },
    data,
    include: {
      subarea: {
        include: {
          area: true
        }
      }
    }
  });
}

export async function deleteConcepto(codigo: string): Promise<void> {
  await prisma.concepto.delete({
    where: { codigo }
  });
}

// Clientes
export async function getAllClientes(): Promise<ClienteWithContacts[]> {
  return await prisma.cliente.findMany({
    include: {
      telefonos: true,
      correos: true
    },
    orderBy: { nombre: 'asc' }
  });
}

export async function getClienteById(id: number): Promise<ClienteWithContacts | null> {
  return await prisma.cliente.findUnique({
    where: { id },
    include: {
      telefonos: true,
      correos: true
    }
  });
}

export async function createCliente(data: { 
  nombre?: string; 
  direccion?: string; 
  fechaRegistro?: Date; 
  activo?: boolean 
}): Promise<Cliente> {
  return await prisma.cliente.create({
    data: {
      ...data,
      fechaRegistro: data.fechaRegistro || new Date()
    }
  });
}

export async function updateCliente(id: number, data: { 
  nombre?: string; 
  direccion?: string; 
  activo?: boolean 
}): Promise<Cliente> {
  return await prisma.cliente.update({
    where: { id },
    data
  });
}

export async function deleteCliente(id: number): Promise<void> {
  await prisma.cliente.delete({
    where: { id }
  });
}

// Teléfonos
export async function createTelefono(data: { clienteId: number; telefono: string }): Promise<Telefono> {
  return await prisma.telefono.create({
    data
  });
}

export async function updateTelefono(id: number, data: { clienteId?: number; telefono?: string }): Promise<Telefono> {
  return await prisma.telefono.update({
    where: { id },
    data
  });
}

export async function deleteTelefono(id: number): Promise<void> {
  await prisma.telefono.delete({
    where: { id }
  });
}

// Correos
export async function createCorreo(data: { clienteId: number; correo: string }): Promise<Correo> {
  return await prisma.correo.create({
    data
  });
}

export async function updateCorreo(id: number, data: { clienteId?: number; correo?: string }): Promise<Correo> {
  return await prisma.correo.update({
    where: { id },
    data
  });
}

export async function deleteCorreo(id: number): Promise<void> {
  await prisma.correo.delete({
    where: { id }
  });
}

// Obras
export async function getAllObras() {
  return await prisma.obra.findMany({
    include: {
      area: true
    },
    orderBy: { clave: 'desc' }
  });
}

export async function getObraById(clave: string) {
  return await prisma.obra.findUnique({
    where: { clave },
    include: {
      area: true
    }
  });
}

export async function getObrasByArea(areaCodigo: string) {
  return await prisma.obra.findMany({
    where: { areaCodigo },
    include: {
      area: true
    },
    orderBy: { clave: 'desc' }
  });
}

export async function createObra(data: { 
  clave: string;
  areaCodigo: string; 
  contratista?: string; 
  estado?: number 
}): Promise<Obra> {
  return await prisma.obra.create({
    data,
    include: {
      area: true
    }
  });
}

export async function updateObra(clave: string, data: { 
  contratista?: string; 
  estado?: number 
}): Promise<Obra> {
  return await prisma.obra.update({
    where: { clave },
    data,
    include: {
      area: true
    }
  });
}

export async function deleteObra(clave: string): Promise<void> {
  await prisma.obra.delete({
    where: { clave }
  });
}

// Presupuestos
export async function getAllPresupuestos() {
  return await prisma.presupuesto.findMany({
    include: {
      obra: {
        include: {
          area: true
        }
      },
      cliente: {
        include: {
          telefonos: true,
          correos: true
        }
      }
    },
    orderBy: { fechaSolicitud: 'desc' }
  });
}

export async function getPresupuestoById(id: number): Promise<PresupuestoWithDetails | null> {
  return await prisma.presupuesto.findUnique({
    where: { id },
    include: {
      obra: {
        include: {
          area: true
        }
      },
      cliente: {
        include: {
          telefonos: true,
          correos: true
        }
      },
      detalles: {
        include: {
          concepto: {
            include: {
              subarea: {
                include: {
                  area: true
                }
              }
            }
          }
        },
        orderBy: { id: 'asc' }
      }
    }
  });
}

export async function getPresupuestosByObra(claveObra: string) {
  return await prisma.presupuesto.findMany({
    where: { claveObra },
    include: {
      obra: {
        include: {
          area: true
        }
      },
      cliente: {
        include: {
          telefonos: true,
          correos: true
        }
      }
    },
    orderBy: { fechaSolicitud: 'desc' }
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
      fechaSolicitud: new Date()
    },
    include: {
      obra: {
        include: {
          area: true
        }
      },
      cliente: true
    }
  });
}

export async function updatePresupuesto(id: number, data: { 
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
}): Promise<Presupuesto> {
  return await prisma.presupuesto.update({
    where: { id },
    data,
    include: {
      obra: {
        include: {
          area: true
        }
      },
      cliente: true
    }
  });
}

export async function deletePresupuesto(id: number): Promise<void> {
  await prisma.presupuesto.delete({
    where: { id }
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
              area: true
            }
          }
        }
      }
    },
    orderBy: { id: 'asc' }
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
              area: true
            }
          }
        }
      }
    }
  });
}

export async function updatePresupuestoDetalle(id: number, data: { 
  conceptoCodigo?: string; 
  cantidad?: number;
  precioUnitario?: number;
  subtotal?: number;
  estado?: any;
}) {
  return await prisma.presupuestoDetalle.update({
    where: { id },
    data,
    include: {
      concepto: {
        include: {
          subarea: {
            include: {
              area: true
            }
          }
        }
      }
    }
  });
}

export async function deletePresupuestoDetalle(id: number): Promise<void> {
  await prisma.presupuestoDetalle.delete({
    where: { id }
  });
}

export async function deletePresupuestoDetallesByPresupuestoId(presupuestoId: number): Promise<void> {
  await prisma.presupuestoDetalle.deleteMany({
    where: { presupuestoId }
  });
}

// Función auxiliar para calcular totales de presupuesto
export async function recalcularTotalesPresupuesto(presupuestoId: number): Promise<Presupuesto> {
  const detalles = await prisma.presupuestoDetalle.findMany({
    where: { presupuestoId }
  });

  const subtotal = detalles.reduce((sum, detalle) => {
    const subtotalDetalle = detalle.subtotal ? Number(detalle.subtotal) : 0;
    return sum + subtotalDetalle;
  }, 0);
  
  const presupuesto = await prisma.presupuesto.findUnique({ where: { id: presupuestoId } });
  
  if (!presupuesto) {
    throw new Error('Presupuesto no encontrado');
  }

  const ivaPorcentaje = presupuesto.iva ? Number(presupuesto.iva) : 0;
  const ivaMonto = subtotal * ivaPorcentaje;
  const total = subtotal + ivaMonto;

  return await prisma.presupuesto.update({
    where: { id: presupuestoId },
    data: {
      subtotal,
      ivaMonto,
      total
    },
    include: {
      obra: {
        include: {
          area: true
        }
      },
      cliente: true
    }
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
        año
      }
    }
  });

  if (!contador) {
    // Crear nuevo contador si no existe
    contador = await prisma.contadorObras.create({
      data: {
        areaCodigo,
        año,
        contador: 1
      }
    });
  } else {
    // Incrementar contador existente
    contador = await prisma.contadorObras.update({
      where: {
        areaCodigo_año: {
          areaCodigo,
          año
        }
      },
      data: {
        contador: (contador.contador || 0) + 1
      }
    });
  }

  // Formatear clave: [área]-[año]-[consecutivo]
  const claveObra = `${areaCodigo.toLowerCase()}-${año.toString().slice(-2)}-${String(contador.contador).padStart(3, '0')}`;
  
  // Crear la obra
  await prisma.obra.create({
    data: {
      clave: claveObra,
      areaCodigo,
      estado: 1
    }
  });

  return claveObra;
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
  generateClaveObra
};