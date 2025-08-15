import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../shared/components/ui/dropdown-menu";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { useToast } from "../../dashboard/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Building,
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  RefreshCw,
  Hash,
  User,
  AlertCircle,
  CalendarIcon,
  Edit,
  Clock,
  CheckCircle,
  X,
  Check,
  Trash2,
  Download,
  Eye,
  MoreHorizontal,
  FileDown,
  FileText,
  ArrowUpDown,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

import { AdvancedObraForm } from "../components/AdvancedObraForm.tsx";
import { Obra as ObraType } from "../types";

// Constantes de colores empresariales - copiados desde presupuesto
const BRAND_COLORS = {
  primary: "#2563eb", // Azul empresarial
  secondary: "#475569", // Gris azulado
  accent: "#10b981", // Verde éxito
  warning: "#f59e0b", // Ámbar
  error: "#ef4444", // Rojo
  white: "#ffffff",
  backgroundLight: "#f8fafc", // Fondo muy claro
  border: "#e2e8f0", // Borde sutil
  textPrimary: "#1e293b", // Texto principal
  textSecondary: "#64748b", // Texto secundario
};

interface Obra {
  id: number;
  clave: string;
  nombre: string;
  descripcion: string;
  responsable?: string;
  contacto?: string;
  direccion?: string;
  fechaInicio?: string;
  fechaFinPrevista?: string;
  fechaFin?: string;
  estado: string;
  presupuestoEstimado?: number;
  presupuestoTotal?: number;
  cliente?: {
    id: number;
    nombre: string;
    telefonos?: Array<{ telefono: string }>;
    correos?: Array<{ correo: string }>;
  };
  notas?: string;
  alcance?: string;
  objetivos?: string;
  razonCancelacion?: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
  creadoPor?: string;
  actualizadoPor?: string;
}

// Estados para obras - adaptados de presupuestos
const OBRA_ESTADOS = {
  planificacion: { label: "Planificación", color: "bg-gray-100 text-gray-800" },
  iniciada: { label: "Iniciada", color: "bg-blue-100 text-blue-800" },
  en_progreso: { label: "En Progreso", color: "bg-yellow-100 text-yellow-800" },
  pausada: { label: "Pausada", color: "bg-orange-100 text-orange-800" },
  completada: { label: "Completada", color: "bg-green-100 text-green-800" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

// Función para obtener el estado visual de la obra
const getStatusObra = (estado: string) => {
  const statusConfig = OBRA_ESTADOS[estado as keyof typeof OBRA_ESTADOS] || {
    label: estado,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}
    >
      {statusConfig.label}
    </span>
  );
};

export function ObrasNew() {
  // Estados principales
  const [showForm, setShowForm] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Estados de selección y UI
  const [selectedObras, setSelectedObras] = useState<number[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(
    new Set()
  );

  // Estados de modales
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingObra, setRejectingObra] = useState<Obra | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");

  // Estados de ordenamiento
  const [sortBy, setSortBy] = useState<string>("fechaCreacion");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Obtener usuario actual (para auditoría)
  const { data: usuario } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Error al obtener usuario");
      return response.json();
    },
  });

  // Obtener obras
  const {
    data: obras = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/obras"],
    queryFn: async () => {
      const response = await fetch("/api/obras");
      if (!response.ok) throw new Error("Error al obtener obras");
      return response.json();
    },
  });

  // Obtener clientes para filtros
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clientes"],
    queryFn: async () => {
      const response = await fetch("/api/clientes");
      if (!response.ok) throw new Error("Error al obtener clientes");
      return response.json();
    },
  });

  // Filtrado y ordenamiento de obras
  const filteredAndSortedObras = useMemo(() => {
    let filtered = obras.filter((obra: Obra) => {
      const matchesSearch =
        searchTerm === "" ||
        obra.clave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obra.cliente?.nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        obra.cliente?.telefonos?.some((t) => t.telefono.includes(searchTerm)) ||
        obra.cliente?.correos?.some((c) =>
          c.correo.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || obra.estado === statusFilter;
      const matchesClient =
        clientFilter === "all" || obra.cliente?.id.toString() === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    });

    // Ordenamiento
    filtered.sort((a: Obra, b: Obra) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "clave":
          aValue = a.clave || "";
          bValue = b.clave || "";
          break;
        case "cliente":
          aValue = a.cliente?.nombre || "";
          bValue = b.cliente?.nombre || "";
          break;
        case "estado":
          aValue = a.estado || "";
          bValue = b.estado || "";
          break;
        case "fechaCreacion":
          aValue = new Date(a.fechaCreacion || 0);
          bValue = new Date(b.fechaCreacion || 0);
          break;
        case "fechaInicio":
          aValue = new Date(a.fechaInicio || 0);
          bValue = new Date(b.fechaInicio || 0);
          break;
        case "presupuestoTotal":
          aValue = a.presupuestoTotal || 0;
          bValue = b.presupuestoTotal || 0;
          break;
        default:
          aValue = a.fechaCreacion || "";
          bValue = b.fechaCreacion || "";
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [obras, searchTerm, statusFilter, clientFilter, sortBy, sortOrder]);

  // Paginación
  const totalPages = Math.ceil(filteredAndSortedObras.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedObras = filteredAndSortedObras.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Función para manejar ordenamiento
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  // Función para expandir/contraer descripciones
  const toggleDescription = (obraId: number) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(obraId)) {
      newExpanded.delete(obraId);
    } else {
      newExpanded.add(obraId);
    }
    setExpandedDescriptions(newExpanded);
  };

  // Función para determinar si mostrar botón de expansión
  const shouldShowExpandButton = (description?: string) => {
    if (!description) return false;
    return description.length > 100; // Mostrar si es muy largo
  };

  // Función para seleccionar todas las obras de la página actual
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = [
        ...selectedObras,
        ...paginatedObras.map((obra: Obra) => obra.id),
      ];
      setSelectedObras(Array.from(new Set(newSelection))); // Eliminar duplicados
    } else {
      const pageIds = paginatedObras.map((obra: Obra) => obra.id);
      setSelectedObras(selectedObras.filter((id) => !pageIds.includes(id)));
    }
  };

  // Mutación para crear obra
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/obras", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Agregar credentials para autenticación
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear obra");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/obras"] });
      setShowForm(false);
      toast({
        title: "Éxito",
        description: "Obra creada exitosamente",
      });
    },
    onError: (error: Error) => {
      console.error("Error creating obra:", error);
      toast({
        title: "Error",
        description: error.message || "Error al crear obra",
        variant: "destructive",
      });
    },
  });

  // Mutación para actualizar obra
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/obras/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Agregar credentials para autenticación
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar obra");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/obras"] });
      setShowForm(false);
      setEditingObra(null);
      toast({
        title: "Éxito",
        description: "Obra actualizada exitosamente",
      });
    },
    onError: (error: Error) => {
      console.error("Error updating obra:", error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar obra",
        variant: "destructive",
      });
    },
  });

  // Función para manejar envío del formulario
  const handleSubmit = (data: any) => {
    if (editingObra) {
      updateMutation.mutate({ ...data, id: editingObra.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // Función para editar obra
  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setShowForm(true);
  };

  // Función para eliminar obra
  const handleDelete = async (obraId: number) => {
    if (!confirm("¿Está seguro de que desea eliminar esta obra?")) return;

    try {
      const response = await fetch(`/api/obras/${obraId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar obra");

      queryClient.invalidateQueries({ queryKey: ["/api/obras"] });
      toast({
        title: "Éxito",
        description: "Obra eliminada exitosamente",
      });
    } catch (error) {
      console.error("Error deleting obra:", error);
      toast({
        title: "Error",
        description: "Error al eliminar obra",
        variant: "destructive",
      });
    }
  };

  // Función para exportar obras seleccionadas
  const handleBulkExport = async () => {
    if (selectedObras.length === 0) {
      toast({
        title: "Error",
        description: "Seleccione al menos una obra para exportar",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/obras/export", {
        method: "POST",
        body: JSON.stringify({ obraIds: selectedObras }),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Error al exportar obras");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `obras_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Éxito",
        description: "Obras exportadas exitosamente",
      });
    } catch (error) {
      console.error("Error exporting obras:", error);
      toast({
        title: "Error",
        description: "Error al exportar obras",
        variant: "destructive",
      });
    }
  };

  // Función para previsualizar obra
  const handlePreviewObra = (obraId: number) => {
    window.open(`/api/obras/${obraId}/preview`, "_blank");
  };

  // Función para exportar obra individual
  const handleExportObra = async (obraId: number) => {
    try {
      const response = await fetch(`/api/obras/${obraId}/export`);
      if (!response.ok) throw new Error("Error al exportar obra");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `obra_${obraId}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Éxito",
        description: "Obra exportada exitosamente",
      });
    } catch (error) {
      console.error("Error exporting obra:", error);
      toast({
        title: "Error",
        description: "Error al exportar obra",
        variant: "destructive",
      });
    }
  };

  // Función para abrir modal de auditoría
  const handleShowAudit = (obra: Obra) => {
    // Implementar modal de auditoría si es necesario
    toast({
      title: "Información",
      description: "Función de auditoría en desarrollo",
    });
  };

  // Función para abrir modal de rechazo/cancelación
  const handleOpenRejectModal = (obra: Obra) => {
    setRejectingObra(obra);
    setRejectReason("");
    setCustomRejectReason("");
    setShowRejectModal(true);
  };

  // Función para confirmar rechazo/cancelación
  const handleConfirmReject = () => {
    if (!rejectingObra || !rejectReason) return;

    const finalReason =
      rejectReason === "otra"
        ? customRejectReason
        : rejectReason === "problemas_presupuesto"
        ? "Esta obra se cancela por problemas de presupuesto"
        : rejectReason === "problemas_cliente"
        ? "Esta obra se cancela por problemas del cliente"
        : rejectReason;

    updateStatusMutation.mutate({
      id: rejectingObra.id,
      estado: "cancelada",
      razonCancelacion: finalReason,
    });

    setShowRejectModal(false);
  };

  // Mutación para actualizar estado de obra
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      estado,
      razonCancelacion,
    }: {
      id: number;
      estado: string;
      razonCancelacion?: string;
    }) => {
      const updateData: any = { estado };
      if (razonCancelacion) {
        updateData.razonCancelacion = razonCancelacion;
      }

      const response = await fetch(`/api/obras/${id}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/obras"] });
    },
  });

  // Vista del formulario
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {editingObra ? "Editar Obra" : "Nueva Obra"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {editingObra
                  ? "Modificar obra existente"
                  : "Crear nueva obra con clave automática"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingObra(null);
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Lista
          </Button>
        </div>

        <AdvancedObraForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={editingObra}
        />
      </div>
    );
  }

  // Vista principal de la lista
  return (
    <div
      className="space-y-6"
      style={{
        backgroundColor: BRAND_COLORS.backgroundLight,
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* 🔴 HEADER/ENCABEZADO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building
            className="h-8 w-8"
            style={{ color: BRAND_COLORS.primary }}
          />
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              Gestión de Obras
            </h1>
            <p style={{ color: BRAND_COLORS.textSecondary }}>
              Administre obras, proyectos y construcciones del laboratorio
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleBulkExport}
            variant="outline"
            disabled={selectedObras.length === 0}
            className="flex items-center space-x-2"
            style={{
              borderColor: BRAND_COLORS.textSecondary,
              color:
                selectedObras.length === 0
                  ? BRAND_COLORS.textSecondary
                  : BRAND_COLORS.textPrimary,
            }}
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar Seleccionadas ({selectedObras.length})</span>
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: BRAND_COLORS.primary,
              color: BRAND_COLORS.white,
              border: "none",
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Crear Nueva Obra</span>
          </Button>
        </div>
      </div>

      {/* 🔴 TARJETAS DE FILTROS */}
      <Card
        style={{
          backgroundColor: BRAND_COLORS.white,
          border: `1px solid ${BRAND_COLORS.border}`,
        }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center space-x-2"
            style={{ color: BRAND_COLORS.textPrimary }}
          >
            <Filter
              className="h-5 w-5"
              style={{ color: BRAND_COLORS.primary }}
            />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por clave, nombre, descripción, responsable..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="planificacion">Planificación</SelectItem>
                <SelectItem value="iniciada">Iniciada</SelectItem>
                <SelectItem value="en_progreso">En Progreso</SelectItem>
                <SelectItem value="pausada">Pausada</SelectItem>
                <SelectItem value="completada">Completada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            {/* Client Filter */}
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los clientes</SelectItem>
                {clients?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Refresh Button */}
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Actualizar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Cargando obras...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando {startIndex + 1}-
              {Math.min(
                startIndex + itemsPerPage,
                filteredAndSortedObras.length
              )}{" "}
              de {filteredAndSortedObras.length} obras
            </p>
            {filteredAndSortedObras.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    selectedObras.length === paginatedObras.length &&
                    paginatedObras.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">
                  Seleccionar todas en esta página
                </Label>
              </div>
            )}
          </div>

          {/* Table */}
          {filteredAndSortedObras.length > 0 ? (
            <Card
              style={{
                backgroundColor: BRAND_COLORS.white,
                border: `1px solid ${BRAND_COLORS.border}`,
              }}
            >
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow
                        style={{
                          backgroundColor: BRAND_COLORS.backgroundLight,
                        }}
                      >
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedObras.length === paginatedObras.length &&
                              paginatedObras.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-32"
                          onClick={() => handleSort("clave")}
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <Hash
                              className="h-4 w-4"
                              style={{ color: BRAND_COLORS.primary }}
                            />
                            <span>Clave</span>
                            <ArrowUpDown
                              className="h-3 w-3"
                              style={{ color: BRAND_COLORS.textSecondary }}
                            />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-48"
                          onClick={() => handleSort("cliente")}
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <User
                              className="h-4 w-4"
                              style={{ color: BRAND_COLORS.primary }}
                            />
                            <span>Cliente</span>
                            <ArrowUpDown
                              className="h-3 w-3"
                              style={{ color: BRAND_COLORS.textSecondary }}
                            />
                          </div>
                        </TableHead>
                        <TableHead
                          className="w-80"
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          Descripción
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-32"
                          onClick={() => handleSort("estado")}
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <AlertCircle
                              className="h-4 w-4"
                              style={{ color: BRAND_COLORS.primary }}
                            />
                            <span>Estado</span>
                            <ArrowUpDown
                              className="h-3 w-3"
                              style={{ color: BRAND_COLORS.textSecondary }}
                            />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-28"
                          onClick={() => handleSort("fechaCreacion")}
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <CalendarIcon
                              className="h-4 w-4"
                              style={{ color: BRAND_COLORS.primary }}
                            />
                            <span>Creado</span>
                            <ArrowUpDown
                              className="h-3 w-3"
                              style={{ color: BRAND_COLORS.textSecondary }}
                            />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-32"
                          onClick={() => handleSort("presupuestoTotal")}
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Presupuesto</span>
                            <ArrowUpDown
                              className="h-3 w-3"
                              style={{ color: BRAND_COLORS.textSecondary }}
                            />
                          </div>
                        </TableHead>
                        <TableHead
                          className="text-center w-32"
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          Acciones
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedObras.map((obra: Obra) => (
                        <TableRow
                          key={obra.id}
                          className="transition-colors cursor-default hover:bg-slate-50/50 min-h-16"
                          style={{
                            backgroundColor: BRAND_COLORS.white,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `${BRAND_COLORS.backgroundLight}80`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              BRAND_COLORS.white;
                          }}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedObras.includes(obra.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedObras([...selectedObras, obra.id]);
                                } else {
                                  setSelectedObras(
                                    selectedObras.filter((id) => id !== obra.id)
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {obra.clave ? (
                              <span style={{ color: BRAND_COLORS.textPrimary }}>
                                {obra.clave}
                              </span>
                            ) : (
                              <span
                                style={{ color: BRAND_COLORS.textSecondary }}
                              >
                                Sin asignar
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p
                                className="font-medium"
                                style={{ color: BRAND_COLORS.textPrimary }}
                              >
                                {obra.cliente?.nombre || "Sin cliente"}
                              </p>
                              {/* Mostrar teléfonos del cliente */}
                              {obra.cliente?.telefonos &&
                                obra.cliente.telefonos.length > 0 && (
                                  <p
                                    className="text-xs"
                                    style={{
                                      color: BRAND_COLORS.textSecondary,
                                    }}
                                  >
                                    📞 {obra.cliente.telefonos[0].telefono}
                                    {obra.cliente.telefonos.length > 1 &&
                                      ` (+${
                                        obra.cliente.telefonos.length - 1
                                      })`}
                                  </p>
                                )}
                              {/* Mostrar correos del cliente */}
                              {obra.cliente?.correos &&
                                obra.cliente.correos.length > 0 && (
                                  <p
                                    className="text-xs"
                                    style={{
                                      color: BRAND_COLORS.textSecondary,
                                    }}
                                  >
                                    📧 {obra.cliente.correos[0].correo}
                                    {obra.cliente.correos.length > 1 &&
                                      ` (+${obra.cliente.correos.length - 1})`}
                                  </p>
                                )}
                              {obra.responsable && (
                                <p
                                  className="text-sm"
                                  style={{ color: BRAND_COLORS.textSecondary }}
                                >
                                  Responsable: {obra.responsable}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="w-80">
                            <div className="relative">
                              <div
                                className={`text-sm py-2 transition-all duration-300 ${
                                  expandedDescriptions.has(obra.id)
                                    ? "max-h-none"
                                    : "max-h-10 overflow-hidden"
                                }`}
                                style={{
                                  color: BRAND_COLORS.textPrimary,
                                  wordBreak: "break-word",
                                  whiteSpace: "normal",
                                  lineHeight: "1.4",
                                  display: expandedDescriptions.has(obra.id)
                                    ? "block"
                                    : "-webkit-box",
                                  WebkitLineClamp: expandedDescriptions.has(
                                    obra.id
                                  )
                                    ? "none"
                                    : 2,
                                  WebkitBoxOrient: "vertical" as any,
                                }}
                              >
                                {obra.descripcion || "Sin descripción"}
                              </div>
                              {shouldShowExpandButton(obra.descripcion) && (
                                <button
                                  onClick={() => toggleDescription(obra.id)}
                                  className="flex items-center space-x-1 text-xs mt-2 px-3 py-1.5 rounded-md border transition-all duration-200 hover:shadow-sm"
                                  style={{
                                    color: BRAND_COLORS.primary,
                                    borderColor: BRAND_COLORS.border,
                                    backgroundColor: expandedDescriptions.has(
                                      obra.id
                                    )
                                      ? BRAND_COLORS.backgroundLight
                                      : BRAND_COLORS.white,
                                  }}
                                >
                                  <span className="font-medium">
                                    {expandedDescriptions.has(obra.id)
                                      ? "Mostrar menos"
                                      : "Mostrar más"}
                                  </span>
                                  <ChevronDown
                                    className={`h-3 w-3 transition-transform duration-200 ${
                                      expandedDescriptions.has(obra.id)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusObra(obra.estado)}</TableCell>
                          <TableCell
                            className="text-sm"
                            style={{ color: BRAND_COLORS.textSecondary }}
                          >
                            {obra.fechaCreacion
                              ? format(
                                  new Date(obra.fechaCreacion),
                                  "dd/MM/yyyy",
                                  { locale: es }
                                )
                              : "-"}
                          </TableCell>
                          <TableCell
                            className="font-medium"
                            style={{ color: BRAND_COLORS.primary }}
                          >
                            $
                            {Number(obra.presupuestoTotal || 0).toLocaleString(
                              "es-MX",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExportObra(obra.id)}
                                title="Exportar PDF"
                                className="hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreviewObra(obra.id)}
                                title="Previsualizar"
                                className="hover:bg-green-50"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hover:bg-gray-50"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-48"
                                >
                                  <DropdownMenuLabel>
                                    Acciones
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {usuario?.rol === "admin" && (
                                    <DropdownMenuItem
                                      onClick={() => handleShowAudit(obra)}
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      Ver auditoría
                                    </DropdownMenuItem>
                                  )}
                                  {usuario?.rol === "admin" && (
                                    <DropdownMenuSeparator />
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(obra)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar Obra
                                  </DropdownMenuItem>
                                  {obra.estado === "planificacion" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateStatusMutation.mutate({
                                          id: obra.id,
                                          estado: "iniciada",
                                        })
                                      }
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Iniciar Obra
                                    </DropdownMenuItem>
                                  )}
                                  {obra.estado === "iniciada" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateStatusMutation.mutate({
                                          id: obra.id,
                                          estado: "en_progreso",
                                        })
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Marcar en Progreso
                                    </DropdownMenuItem>
                                  )}
                                  {(obra.estado === "iniciada" ||
                                    obra.estado === "en_progreso") && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateStatusMutation.mutate({
                                            id: obra.id,
                                            estado: "completada",
                                          })
                                        }
                                      >
                                        <Check className="h-4 w-4 mr-2" />
                                        Completar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          updateStatusMutation.mutate({
                                            id: obra.id,
                                            estado: "pausada",
                                          })
                                        }
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Pausar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleOpenRejectModal(obra)
                                        }
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {obra.estado === "pausada" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateStatusMutation.mutate({
                                          id: obra.id,
                                          estado: "en_progreso",
                                        })
                                      }
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Reanudar
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {(obra.estado === "completada" ||
                                    obra.estado === "cancelada") && (
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(obra.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card
              style={{
                backgroundColor: BRAND_COLORS.white,
                border: `1px solid ${BRAND_COLORS.border}`,
              }}
            >
              <CardContent className="text-center py-12">
                <Building
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: BRAND_COLORS.textSecondary }}
                />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  No se encontraron obras
                </h3>
                <p
                  className="mb-6"
                  style={{ color: BRAND_COLORS.textSecondary }}
                >
                  {searchTerm ||
                  statusFilter !== "all" ||
                  clientFilter !== "all"
                    ? "Intente ajustar los filtros para encontrar obras"
                    : "Cree su primera obra para comenzar"}
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  className="hover:opacity-90 transition-opacity"
                  style={{
                    backgroundColor: BRAND_COLORS.primary,
                    color: BRAND_COLORS.white,
                    border: "none",
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Obra
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}

      {/* 🔴 MODAL DE CANCELACIÓN */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent
          className="sm:max-w-md"
          style={{
            backgroundColor: BRAND_COLORS.white,
            border: `1px solid ${BRAND_COLORS.border}`,
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="flex items-center space-x-2"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              <AlertTriangle
                className="h-5 w-5"
                style={{ color: BRAND_COLORS.error }}
              />
              <span>Cancelar Obra</span>
            </DialogTitle>
            <DialogDescription style={{ color: BRAND_COLORS.textSecondary }}>
              Seleccione la razón por la cual se cancela esta obra:
              <strong
                className="block mt-1"
                style={{ color: BRAND_COLORS.textPrimary }}
              >
                {rejectingObra?.clave || "Sin clave"} -{" "}
                {rejectingObra?.nombre || "Sin nombre"}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label
                className="text-base font-medium"
                style={{ color: BRAND_COLORS.textPrimary }}
              >
                Motivo de la cancelación:
              </Label>

              <div className="space-y-2">
                <label
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value="problemas_presupuesto"
                    checked={rejectReason === "problemas_presupuesto"}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ accentColor: BRAND_COLORS.error }}
                  />
                  <span>Esta obra se cancela por problemas de presupuesto</span>
                </label>

                <label
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value="problemas_cliente"
                    checked={rejectReason === "problemas_cliente"}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ accentColor: BRAND_COLORS.error }}
                  />
                  <span>Esta obra se cancela por problemas del cliente</span>
                </label>

                <label
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value="otra"
                    checked={rejectReason === "otra"}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ accentColor: BRAND_COLORS.error }}
                  />
                  <span>Otra razón</span>
                </label>
              </div>

              {rejectReason === "otra" && (
                <div className="mt-3">
                  <Label
                    htmlFor="customReason"
                    style={{ color: BRAND_COLORS.textSecondary }}
                  >
                    Describa la razón:
                  </Label>
                  <Textarea
                    id="customReason"
                    placeholder="Escriba el motivo de la cancelación..."
                    value={customRejectReason}
                    onChange={(e) => setCustomRejectReason(e.target.value)}
                    className="mt-1"
                    rows={3}
                    style={{
                      backgroundColor: BRAND_COLORS.white,
                      borderColor: BRAND_COLORS.border,
                      color: BRAND_COLORS.textPrimary,
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                style={{
                  borderColor: BRAND_COLORS.textSecondary,
                  color: BRAND_COLORS.textPrimary,
                }}
                className="hover:opacity-75 transition-opacity"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmReject}
                disabled={
                  !rejectReason ||
                  (rejectReason === "otra" && !customRejectReason.trim())
                }
                style={{
                  backgroundColor: BRAND_COLORS.error,
                  color: BRAND_COLORS.white,
                  border: "none",
                }}
                className="hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar Obra
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
