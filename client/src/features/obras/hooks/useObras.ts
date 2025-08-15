import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createObra, deleteObra, fetchObra, fetchObras, fetchPresupuestosDeObra, updateObra, fetchDetalles, createDetalle, deleteDetalle, fetchAreas } from "../services/obrasApi";

export function useObras(areaCodigo?: string) {
  return useQuery({ queryKey: ["obras", areaCodigo], queryFn: () => fetchObras(areaCodigo) });
}

export function useObra(clave: string) {
  return useQuery({ queryKey: ["obra", clave], queryFn: () => fetchObra(clave), enabled: !!clave });
}

export function useCrearObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createObra,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["obras"] });
    },
  });
}

export function useActualizarObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clave, data }: { clave: string; data: any }) => updateObra(clave, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["obra", variables.clave] });
      qc.invalidateQueries({ queryKey: ["obras"] });
    },
  });
}

export function useEliminarObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clave: string) => deleteObra(clave),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["obras"] }),
  });
}

export function usePresupuestosDeObra(clave?: string) {
  return useQuery({
    queryKey: ["obra", clave, "presupuestos"],
    queryFn: () => fetchPresupuestosDeObra(clave as string),
    enabled: !!clave,
  });
}

export function useDetallesPresupuesto(presupuestoId?: number) {
  return useQuery({
    queryKey: ["presupuesto", presupuestoId, "detalles"],
    queryFn: () => fetchDetalles(presupuestoId as number),
    enabled: !!presupuestoId,
  });
}

export function useAgregarDetalle(presupuestoId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { conceptoCodigo: string; cantidad: number; precioUnitario: number }) => createDetalle(presupuestoId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presupuesto", presupuestoId, "detalles"] }),
  });
}

export function useEliminarDetalle(presupuestoId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (detalleId: number) => deleteDetalle(presupuestoId, detalleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["presupuesto", presupuestoId, "detalles"] }),
  });
}

export function useAreas() {
  return useQuery({ queryKey: ["areas"], queryFn: fetchAreas });
}
