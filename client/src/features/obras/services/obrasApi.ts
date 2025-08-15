import { Obra, PresupuestoResumen, ObraEstado, CreateObraRequest, UpdateObraRequest } from "../types";

// Helper function to map database obra to frontend Obra type
function mapDbObraToObra(dbObra: any): Obra {
  // Map number estado to string
  const estadoMap: { [key: number]: ObraEstado } = {
    0: 'planificacion',
    1: 'iniciada',
    2: 'en_progreso',
    3: 'pausada',
    4: 'completada',
    5: 'cancelada'
  };

  return {
    ...dbObra,
    id: dbObra.clave, // Map clave to id for UI compatibility
    estado: estadoMap[dbObra.estado] || 'iniciada',
    fechaInicio: dbObra.fechaInicio ? new Date(dbObra.fechaInicio).toISOString() : undefined,
    fechaFinPrevista: dbObra.fechaFinPrevista ? new Date(dbObra.fechaFinPrevista).toISOString() : undefined,
    fechaFin: dbObra.fechaFin ? new Date(dbObra.fechaFin).toISOString() : undefined,
    fechaCreacion: dbObra.fechaCreacion ? new Date(dbObra.fechaCreacion).toISOString() : undefined,
    fechaActualizacion: dbObra.fechaActualizacion ? new Date(dbObra.fechaActualizacion).toISOString() : undefined,
  };
}

export async function fetchObras(areaCodigo?: string): Promise<Obra[]> {
  const url = areaCodigo ? `/api/obras?area=${encodeURIComponent(areaCodigo)}` : "/api/obras";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al cargar obras");
  const dbObras = await res.json();
  return dbObras.map(mapDbObraToObra);
}

export async function fetchObra(clave: string): Promise<Obra> {
  const res = await fetch(`/api/obras/${encodeURIComponent(clave)}`);
  if (!res.ok) throw new Error("Obra no encontrada");
  const dbObra = await res.json();
  return mapDbObraToObra(dbObra);
}

export async function createObra(data: CreateObraRequest): Promise<Obra> {
  const res = await fetch("/api/obras", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear la obra");
  const dbObra = await res.json();
  return mapDbObraToObra(dbObra);
}

export async function updateObra(clave: string, data: UpdateObraRequest): Promise<Obra> {
  const res = await fetch(`/api/obras/${encodeURIComponent(clave)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar la obra");
  const dbObra = await res.json();
  return mapDbObraToObra(dbObra);
}

export async function deleteObra(clave: string): Promise<void> {
  const res = await fetch(`/api/obras/${encodeURIComponent(clave)}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la obra");
}

export async function fetchPresupuestosDeObra(clave: string): Promise<PresupuestoResumen[]> {
  const res = await fetch(`/api/obras/${encodeURIComponent(clave)}/presupuestos`);
  if (!res.ok) throw new Error("Error al cargar presupuestos de la obra");
  return res.json();
}

// Detalles (conceptos) por presupuesto
export async function fetchDetalles(presupuestoId: number) {
  const res = await fetch(`/api/presupuestos/${presupuestoId}/detalles`);
  if (!res.ok) throw new Error("Error al cargar conceptos del presupuesto");
  return res.json();
}

export async function createDetalle(presupuestoId: number, data: { conceptoCodigo: string; cantidad: number; precioUnitario: number }) {
  const res = await fetch(`/api/presupuestos/${presupuestoId}/detalles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, presupuestoId }),
  });
  if (!res.ok) throw new Error("Error al agregar concepto");
  return res.json();
}

export async function deleteDetalle(presupuestoId: number, detalleId: number) {
  const res = await fetch(`/api/presupuestos/${presupuestoId}/detalles/${detalleId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar concepto");
}

// Áreas para formulario
export async function fetchAreas(): Promise<{ codigo: string; nombre?: string | null }[]> {
  const res = await fetch("/api/areas");
  if (!res.ok) throw new Error("Error al cargar áreas");
  return res.json();
}
