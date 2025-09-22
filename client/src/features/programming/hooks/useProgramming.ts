import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programmingService } from "../services/programmingService";
import { useToast } from "../../dashboard/hooks/use-toast";
import type {
  Programacion,
  ProgramacionFormData,
  ProgramacionFilters,
  ProgramacionStatusUpdate,
  WeeklyProgramming,
  PresupuestoAprobado
} from "../types/programming";

// ============ QUERY HOOKS ============

export function useProgrammings(filters?: ProgramacionFilters) {
  return useQuery({
    queryKey: ["programaciones", filters],
    queryFn: () => programmingService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useProgramming(id: number) {
  return useQuery({
    queryKey: ["programaciones", id],
    queryFn: () => programmingService.getById(id),
    enabled: !!id,
  });
}

export function useWeeklyStats(fecha?: string) {
  return useQuery({
    queryKey: ["programaciones", "stats", "semanal", fecha],
    queryFn: () => programmingService.getWeeklyStats(fecha),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

export function usePresupuestosAprobados() {
  return useQuery({
    queryKey: ["presupuestos-aprobados"],
    queryFn: () => programmingService.getPresupuestosAprobados(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// ============ MUTATION HOOKS ============

export function useCreateProgramming() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ProgramacionFormData) => programmingService.create(data),
    onSuccess: () => {
      toast({
        title: "Programación Creada",
        description: "La programación se ha creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["programaciones"] });
      queryClient.invalidateQueries({ queryKey: ["programaciones", "stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la programación",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProgramming() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProgramacionFormData> }) =>
      programmingService.update(id, data),
    onSuccess: (_, { id }) => {
      toast({
        title: "Programación Actualizada",
        description: "La programación se ha actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["programaciones"] });
      queryClient.invalidateQueries({ queryKey: ["programaciones", id] });
      queryClient.invalidateQueries({ queryKey: ["programaciones", "stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la programación",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProgrammingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, statusUpdate }: { id: number; statusUpdate: ProgramacionStatusUpdate }) =>
      programmingService.updateStatus(id, statusUpdate),
    onSuccess: (_, { id, statusUpdate }) => {
      const statusMessages = {
        programada: "Programación actualizada",
        en_proceso: "Programación iniciada",
        completada: "Programación completada",
        cancelada: "Programación cancelada",
        reprogramada: "Programación reprogramada",
      };

      toast({
        title: statusMessages[statusUpdate.estado] || "Estado Actualizado",
        description: "El estado de la programación se ha actualizado exitosamente",
      });
      
      queryClient.invalidateQueries({ queryKey: ["programaciones"] });
      queryClient.invalidateQueries({ queryKey: ["programaciones", id] });
      queryClient.invalidateQueries({ queryKey: ["programaciones", "stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProgramming() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => programmingService.delete(id),
    onSuccess: () => {
      toast({
        title: "Programación Eliminada",
        description: "La programación se ha eliminado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["programaciones"] });
      queryClient.invalidateQueries({ queryKey: ["programaciones", "stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la programación",
        variant: "destructive",
      });
    },
  });
}

// ============ CUSTOM HOOKS ============

export function useProgrammingsByBrigadista(brigadistaId: number, fechaInicio?: string, fechaFin?: string) {
  return useQuery({
    queryKey: ["programaciones", "brigadista", brigadistaId, fechaInicio, fechaFin],
    queryFn: () => programmingService.getByBrigadista(brigadistaId, fechaInicio, fechaFin),
    enabled: !!brigadistaId,
  });
}

export function useProgrammingsByEstado(estado: string, fechaInicio?: string, fechaFin?: string) {
  return useQuery({
    queryKey: ["programaciones", "estado", estado, fechaInicio, fechaFin],
    queryFn: () => programmingService.getByEstado(estado, fechaInicio, fechaFin),
    enabled: !!estado,
  });
}

export function useProgrammingSearch(claveObra: string) {
  return useQuery({
    queryKey: ["programaciones", "search", claveObra],
    queryFn: () => programmingService.searchByClaveObra(claveObra),
    enabled: !!claveObra && claveObra.length >= 3,
  });
}

// ============ UTILITY HOOKS ============

export function useWeekNavigation() {
  const getCurrentWeek = () => new Date();
  
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getWeekEnd = (date: Date) => {
    const end = new Date(getWeekStart(date));
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const getPreviousWeek = (date: Date) => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 7);
    return prev;
  };

  const getNextWeek = (date: Date) => {
    const next = new Date(date);
    next.setDate(date.getDate() + 7);
    return next;
  };

  const formatWeek = (date: Date) => {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    
    return {
      key: programmingService.getWeekKey(date),
      label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      start,
      end,
    };
  };

  return {
    getCurrentWeek,
    getWeekStart,
    getWeekEnd,
    getPreviousWeek,
    getNextWeek,
    formatWeek,
  };
}