import { useQuery } from "@tanstack/react-query";

export function useAdminStats() {
  return useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Error al obtener estadísticas");
      return res.json();
    },
  });
}
