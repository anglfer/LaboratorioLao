import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { conceptService } from "../services/conceptService";
import { ConceptoFormData } from "../types/concept";
import { useToast } from "../../dashboard/hooks/use-toast";

export function useAreas() {
  return useQuery({
    queryKey: ["areas"],
    queryFn: conceptService.getAreas,
  });
}

export function useSubareasByArea(areaCodigo: string | null) {
  return useQuery({
    queryKey: ["subareas", areaCodigo],
    queryFn: () => conceptService.getSubareasByArea(areaCodigo!),
    enabled: !!areaCodigo,
  });
}

export function useConceptosBySubarea(subareaId: number | null) {
  return useQuery({
    queryKey: ["conceptos", subareaId],
    queryFn: () => conceptService.getConceptosBySubarea(subareaId!),
    enabled: !!subareaId,
  });
}

export function useCreateConcepto() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ConceptoFormData) => conceptService.createConcepto(data),
    onSuccess: (data) => {
      // Invalidar las consultas relacionadas
      queryClient.invalidateQueries({
        queryKey: ["conceptos", data.subareaId],
      });

      toast({
        title: "Concepto creado",
        description: "El concepto se ha creado exitosamente.",
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
