import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "../services/budgetService";
import { Budget, BudgetFormData } from "../types/budget";
import { useToast } from "../../../shared/hooks/use-toast";

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: budgetService.getAll,
  });
}

export function useBudget(id: number) {
  return useQuery({
    queryKey: ["budgets", id],
    queryFn: () => budgetService.getById(id),
    enabled: !!id,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: budgetService.create,
    onSuccess: () => {
      toast({
        title: "Presupuesto Creado",
        description: "El presupuesto se ha creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el presupuesto",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      budgetService.update(id, data),
    onSuccess: () => {
      toast({
        title: "Presupuesto Actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el presupuesto",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: budgetService.delete,
    onSuccess: () => {
      toast({
        title: "Presupuesto Eliminado",
        description: "El presupuesto se ha eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el presupuesto",
        variant: "destructive",
      });
    },
  });
}
