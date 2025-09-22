import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import { Badge } from "../../../shared/components/ui/badge";
import {
  Calendar,
  Filter,
  Search,
  Plus,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import ProgrammingCard from "../components/ProgrammingCard";
import {
  useProgrammings,
  useUpdateProgrammingStatus,
  useDeleteProgramming,
} from "../hooks/useProgramming";
import { useBrigadistaOptions } from "../hooks/useBrigadistas";
import { ESTADOS_PROGRAMACION } from "../types/programming";
import type {
  ProgramacionFilters,
  EstadoProgramacion,
} from "../types/programming";

export default function ProgrammingList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ProgramacionFilters>({});
  const [searchTerm, setSearchTerm] = useState("");

  // Queries and mutations
  const { data: programaciones, isLoading, refetch } = useProgrammings(filters);
  const updateStatusMutation = useUpdateProgrammingStatus();
  const deleteMutation = useDeleteProgramming();
  const brigadistaOptions = useBrigadistaOptions();

  const handleFilterChange = (key: keyof ProgramacionFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleStatusChange = (id: number, estado: EstadoProgramacion) => {
    updateStatusMutation.mutate({
      id,
      statusUpdate: { id, estado },
    });
  };

  const handleView = (id: number) => {
    navigate(`/programacion/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/programacion/${id}/editar`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Está seguro de eliminar esta programación?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProgramaciones = programaciones?.filter((prog) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      prog.claveObra.toLowerCase().includes(search) ||
      prog.presupuesto?.cliente?.nombre.toLowerCase().includes(search) ||
      `${prog.brigadistaPrincipal.nombre} ${prog.brigadistaPrincipal.apellidos}`
        .toLowerCase()
        .includes(search)
    );
  });

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  const activeFiltersCount =
    Object.values(filters).filter(Boolean).length + (searchTerm ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate("/programacion")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Lista de Programaciones
            </h1>
            <p className="text-sm text-slate-600">
              Gestionar todas las programaciones de actividades
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => navigate("/programacion/nueva")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Programación
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="text-sm font-medium">Búsqueda</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Clave, cliente, brigadista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={filters.estado || ""}
                onValueChange={(value) => handleFilterChange("estado", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los estados</SelectItem>
                  {Object.entries(ESTADOS_PROGRAMACION).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brigadista */}
            <div>
              <label className="text-sm font-medium">Brigadista</label>
              <Select
                value={filters.brigadistaId?.toString() || ""}
                onValueChange={(value) =>
                  handleFilterChange(
                    "brigadistaId",
                    value ? parseInt(value) : undefined
                  )
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Todos los brigadistas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los brigadistas</SelectItem>
                  {brigadistaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha */}
            <div>
              <label className="text-sm font-medium">Fecha Inicio</label>
              <Input
                type="date"
                value={filters.fechaInicio || ""}
                onChange={(e) =>
                  handleFilterChange("fechaInicio", e.target.value)
                }
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de programaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              Programaciones
              {filteredProgramaciones && (
                <Badge variant="outline" className="ml-2">
                  {filteredProgramaciones.length}
                </Badge>
              )}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Cargando programaciones...</span>
              </div>
            </div>
          ) : filteredProgramaciones?.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay programaciones</p>
              <p className="text-sm">
                {activeFiltersCount > 0
                  ? "No se encontraron programaciones con los filtros aplicados"
                  : "Aún no hay programaciones creadas"}
              </p>
              {activeFiltersCount === 0 && (
                <Button
                  className="mt-4"
                  onClick={() => navigate("/programacion/nueva")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Programación
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProgramaciones?.map((programacion) => (
                <ProgrammingCard
                  key={programacion.id}
                  programacion={programacion}
                  onStatusChange={handleStatusChange}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
