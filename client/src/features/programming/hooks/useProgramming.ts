import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { programmingService } from "../services/programmingService";
import {
  CreateProgramacionData,
  UpdateProgramacionData,
  ProgramacionFilters,
  EstadoProgramacion,
} from "../types/programming";
import { useToast } from "../../../shared/hooks/use-toast";

// ============ KEYS ============
export const programmingKeys = {
  all: ["programming"] as const,
  programaciones: () => [...programmingKeys.all, "programaciones"] as const,
  programacion: (id: number) =>
    [...programmingKeys.programaciones(), id] as const,
  programacionesFiltered: (filters: ProgramacionFilters) =>
    [...programmingKeys.programaciones(), "filtered", filters] as const,
  brigadistas: () => [...programmingKeys.all, "brigadistas"] as const,
  brigadistasDisponibles: (fecha: string, hora: string) =>
    [...programmingKeys.brigadistas(), "disponibles", fecha, hora] as const,
  vehiculos: () => [...programmingKeys.all, "vehiculos"] as const,
  vehiculosDisponibles: (fecha: string, hora: string) =>
    [...programmingKeys.vehiculos(), "disponibles", fecha, hora] as const,
  obrasAprobadas: () => [...programmingKeys.all, "obras", "aprobadas"] as const,
  estadisticasSemana: (fechaInicio: string) =>
    [...programmingKeys.all, "estadisticas", "semana", fechaInicio] as const,
  datosGraficaSemana: (fechaInicio: string) =>
    [...programmingKeys.all, "grafica", "semana", fechaInicio] as const,
  programacionesBrigadista: (brigadistaId: number, fecha?: string) =>
    [...programmingKeys.all, "brigadista", brigadistaId, fecha] as const,
  brigadista: () => [...programmingKeys.all, "brigadista", "perfil"] as const,
  brigadistaProgramaciones: (filters?: ProgramacionFilters) =>
    [...programmingKeys.all, "brigadista", "programaciones", filters] as const,
};

// ============ QUERIES ============

export function useProgramaciones(filters?: ProgramacionFilters) {
  return useQuery({
    queryKey: filters
      ? programmingKeys.programacionesFiltered(filters)
      : programmingKeys.programaciones(),
    queryFn: () => programmingService.getProgramaciones(filters),
  });
}

export function useProgramacion(id: number) {
  return useQuery({
    queryKey: programmingKeys.programacion(id),
    queryFn: () => programmingService.getProgramacionById(id),
    enabled: !!id,
  });
}

export function useBrigadistas() {
  return useQuery({
    queryKey: programmingKeys.brigadistas(),
    queryFn: () => programmingService.getBrigadistas(),
  });
}

export function useBrigadistasDisponibles(fecha: string, hora: string) {
  return useQuery({
    queryKey: programmingKeys.brigadistasDisponibles(fecha, hora),
    queryFn: () => programmingService.getBrigadistasDisponibles(fecha, hora),
    enabled: !!fecha && !!hora,
  });
}

export function useVehiculos() {
  return useQuery({
    queryKey: programmingKeys.vehiculos(),
    queryFn: () => programmingService.getVehiculos(),
  });
}

export function useVehiculosDisponibles(fecha: string, hora: string) {
  return useQuery({
    queryKey: programmingKeys.vehiculosDisponibles(fecha, hora),
    queryFn: () => programmingService.getVehiculosDisponibles(fecha, hora),
    enabled: !!fecha && !!hora,
  });
}

export function useObrasAprobadas() {
  return useQuery({
    queryKey: programmingKeys.obrasAprobadas(),
    queryFn: () => programmingService.getObrasAprobadas(),
  });
}

export function useEstadisticasSemana(fechaInicio: string) {
  return useQuery({
    queryKey: programmingKeys.estadisticasSemana(fechaInicio),
    queryFn: () => programmingService.getEstadisticasSemana(fechaInicio),
    enabled: !!fechaInicio,
  });
}

export function useDatosGraficaSemana(fechaInicio: string) {
  return useQuery({
    queryKey: programmingKeys.datosGraficaSemana(fechaInicio),
    queryFn: () => programmingService.getDatosGraficaSemana(fechaInicio),
    enabled: !!fechaInicio,
  });
}

export function useProgramacionesBrigadista(
  brigadistaId: number,
  fecha?: string,
) {
  return useQuery({
    queryKey: programmingKeys.programacionesBrigadista(brigadistaId, fecha),
    queryFn: () =>
      programmingService.getProgramacionesBrigadista(brigadistaId, fecha),
    enabled: !!brigadistaId,
  });
}

export function useBrigadistaPerfil() {
  return useQuery({
    queryKey: programmingKeys.brigadista(),
    queryFn: () => programmingService.getBrigadistaPerfil(),
  });
}

export function useBrigadistaProgramaciones(filters?: ProgramacionFilters) {
  return useQuery({
    queryKey: programmingKeys.brigadistaProgramaciones(filters),
    queryFn: () => programmingService.getBrigadistaProgramaciones(filters),
  });
}

export function useQuickStats() {
  return useQuery({
    queryKey: [...programmingKeys.all, "quick-stats"],
    queryFn: () => programmingService.getQuickStats(),
  });
}

// ============ MUTATIONS ============

export function useCreateProgramacion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateProgramacionData) =>
      programmingService.createProgramacion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programaciones(),
      });
      queryClient.invalidateQueries({ queryKey: programmingKeys.all });
      toast({
        title: "Programación creada",
        description: "La programación se ha creado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateProgramacion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProgramacionData }) =>
      programmingService.updateProgramacion(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programacion(id),
      });
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programaciones(),
      });
      queryClient.invalidateQueries({ queryKey: programmingKeys.all });
      toast({
        title: "Programación actualizada",
        description: "La programación se ha actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProgramacion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => programmingService.deleteProgramacion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programaciones(),
      });
      queryClient.invalidateQueries({ queryKey: programmingKeys.all });
      toast({
        title: "Programación eliminada",
        description: "La programación se ha eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

// ============ ACCIONES DEL BRIGADISTA ============

export function useIniciarActividad() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => programmingService.iniciarActividad(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programacion(id),
      });
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programaciones(),
      });
      toast({
        title: "Actividad iniciada",
        description: "La actividad se ha iniciado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCompletarActividad() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      muestrasObtenidas,
      observaciones,
    }: {
      id: number;
      muestrasObtenidas: number;
      observaciones?: string;
    }) =>
      programmingService.completarActividad(
        id,
        muestrasObtenidas,
        observaciones,
      ),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programacion(id),
      });
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programaciones(),
      });
      toast({
        title: "Actividad completada",
        description: "La actividad se ha completado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useCancelarActividad() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      programmingService.cancelarActividad(id, motivo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programacion(id),
      });
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programaciones(),
      });
      toast({
        title: "Actividad cancelada",
        description: "La actividad se ha cancelado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useReprogramarActividad() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      nuevaFecha,
      nuevaHora,
    }: {
      id: number;
      nuevaFecha: string;
      nuevaHora: string;
    }) => programmingService.reprogramarActividad(id, nuevaFecha, nuevaHora),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programacion(id),
      });
      queryClient.invalidateQueries({
        queryKey: programmingKeys.programaciones(),
      });
      toast({
        title: "Actividad reprogramada",
        description: "La actividad se ha reprogramado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
