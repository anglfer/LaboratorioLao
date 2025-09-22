import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { brigadistaService } from "../services/brigadistaService";
import { useToast } from "../../dashboard/hooks/use-toast";
import type { Brigadista } from "../types/programming";

// ============ QUERY HOOKS ============

export function useBrigadistas() {
  return useQuery({
    queryKey: ["brigadistas"],
    queryFn: brigadistaService.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useBrigadista(id: number) {
  return useQuery({
    queryKey: ["brigadistas", id],
    queryFn: () => brigadistaService.getById(id),
    enabled: !!id,
  });
}

// ============ MUTATION HOOKS ============

export function useCreateBrigadista() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Brigadista, "id" | "fechaRegistro" | "fechaActualizacion">) =>
      brigadistaService.create(data),
    onSuccess: () => {
      toast({
        title: "Brigadista Creado",
        description: "El brigadista se ha registrado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["brigadistas"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el brigadista",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBrigadista() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Brigadista> }) =>
      brigadistaService.update(id, data),
    onSuccess: (_, { id }) => {
      toast({
        title: "Brigadista Actualizado",
        description: "La información del brigadista se ha actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["brigadistas"] });
      queryClient.invalidateQueries({ queryKey: ["brigadistas", id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el brigadista",
        variant: "destructive",
      });
    },
  });
}

export function useToggleBrigadistaStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      activate ? brigadistaService.activate(id) : brigadistaService.deactivate(id),
    onSuccess: (_, { activate }) => {
      toast({
        title: activate ? "Brigadista Activado" : "Brigadista Desactivado",
        description: `El brigadista se ha ${activate ? "activado" : "desactivado"} exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ["brigadistas"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado del brigadista",
        variant: "destructive",
      });
    },
  });
}

// ============ UTILITY HOOKS ============

export function useBrigadistasActivos() {
  const { data: brigadistas, ...rest } = useBrigadistas();
  
  const brigadistasActivos = brigadistas ? brigadistaService.filterActive(brigadistas) : [];
  const brigadistasOrdenados = brigadistaService.sortByName(brigadistasActivos);

  return {
    data: brigadistasOrdenados,
    ...rest,
  };
}

export function useBrigadistaOptions() {
  const { data: brigadistas } = useBrigadistasActivos();

  const options = brigadistas?.map(brigadista => ({
    value: brigadista.id.toString(),
    label: brigadistaService.getFullName(brigadista),
    brigadista,
  })) || [];

  return options;
}