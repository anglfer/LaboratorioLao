import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clienteService } from "../lib/clienteService";
import type { Cliente } from "../lib/types";

export function useClientes() {
  // Cambiar la queryKey para reflejar el endpoint full
  return useQuery<Cliente[]>({
    queryKey: ["/api/clientes/full"],
    queryFn: clienteService.getAll,
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clienteService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/clientes/full"] }),
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Cliente> }) =>
      clienteService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/clientes/full"] }),
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clienteService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/clientes/full"] }),
  });
}
