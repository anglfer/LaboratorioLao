import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiculoService } from "../services/vehiculoService";
import { useToast } from "../../dashboard/hooks/use-toast";
import type { Vehiculo } from "../types/programming";

// ============ QUERY HOOKS ============

export function useVehiculos() {
  return useQuery({
    queryKey: ["vehiculos"],
    queryFn: vehiculoService.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useVehiculo(id: number) {
  return useQuery({
    queryKey: ["vehiculos", id],
    queryFn: () => vehiculoService.getById(id),
    enabled: !!id,
  });
}

// ============ MUTATION HOOKS ============

export function useCreateVehiculo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Vehiculo, "id" | "fechaRegistro" | "fechaActualizacion">) =>
      vehiculoService.create(data),
    onSuccess: () => {
      toast({
        title: "Vehículo Creado",
        description: "El vehículo se ha registrado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el vehículo",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateVehiculo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Vehiculo> }) =>
      vehiculoService.update(id, data),
    onSuccess: (_, { id }) => {
      toast({
        title: "Vehículo Actualizado",
        description: "La información del vehículo se ha actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      queryClient.invalidateQueries({ queryKey: ["vehiculos", id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el vehículo",
        variant: "destructive",
      });
    },
  });
}

export function useToggleVehiculoStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      activate ? vehiculoService.activate(id) : vehiculoService.deactivate(id),
    onSuccess: (_, { activate }) => {
      toast({
        title: activate ? "Vehículo Activado" : "Vehículo Desactivado",
        description: `El vehículo se ha ${activate ? "activado" : "desactivado"} exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado del vehículo",
        variant: "destructive",
      });
    },
  });
}

// ============ UTILITY HOOKS ============

export function useVehiculosActivos() {
  const { data: vehiculos, ...rest } = useVehiculos();
  
  const vehiculosActivos = vehiculos ? vehiculoService.filterActive(vehiculos) : [];
  const vehiculosOrdenados = vehiculoService.sortByClave(vehiculosActivos);

  return {
    data: vehiculosOrdenados,
    ...rest,
  };
}

export function useVehiculoOptions() {
  const { data: vehiculos } = useVehiculosActivos();

  const options = vehiculos?.map(vehiculo => ({
    value: vehiculo.id.toString(),
    label: vehiculoService.getDisplayName(vehiculo),
    vehiculo,
  })) || [];

  return options;
}