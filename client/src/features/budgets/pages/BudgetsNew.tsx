import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
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
  DialogTrigger,
} from "../../../shared/components/ui/dialog";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import ApprovalModal from "../components/ApprovalModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../shared/components/ui/dropdown-menu";
import { Textarea } from "../../../shared/components/ui/textarea";
import { useToast } from "../../dashboard/hooks/use-toast";
import AdvancedBudgetForm from "../components/AdvancedBudgetForm";
import {
  BRAND_COLORS,
  STATUS_COLORS,
  UI_GUIDELINES,
} from "../../../shared/constants/brandColors";
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Calendar,
  MapPin,
  User,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  FileDown,
  Copy,
  Trash2,
  Calendar as CalendarIcon,
  Building,
  Hash,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "../../dashboard/hooks/useAuth";
import { TipoAprobacion } from "../types/budget";

export default function BudgetsNew() {
  const { usuario } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedBudgets, setSelectedBudgets] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [sortField, setSortField] = useState("fechaSolicitud");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(
    new Set()
  );

  // Estados para el modal de rechazo
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBudget, setRejectingBudget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customRejectReason, setCustomRejectReason] = useState("");

  // Estados para el modal de aprobación
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvingBudget, setApprovingBudget] = useState<any>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch budgets data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/presupuestos"],
    queryFn: async () => {
      const response = await fetch("/api/presupuestos");
      if (!response.ok) throw new Error("Failed to fetch presupuestos");
      return response.json();
    },
  });
  const budgets: any[] = Array.isArray(data) ? data : [];

  // Fetch clients for filter dropdown
  const { data: clients } = useQuery({
    queryKey: ["/api/clientes"],
    queryFn: async () => {
      const response = await fetch("/api/clientes");
      if (!response.ok) throw new Error("Failed to fetch clientes");
      return response.json();
    },
  });

  // Filtered and sorted budgets
  const filteredAndSortedBudgets = useMemo(() => {
    let filtered = budgets.filter((budget) => {
      const matchesSearch =
        !searchTerm ||
        budget.obra?.clave?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.cliente?.nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        budget.obra?.descripcion
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        budget.nombreContratista
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        // Buscar por teléfonos del cliente
        budget.cliente?.telefonos?.some((telefono: any) =>
          telefono.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        // Buscar por correos del cliente
        budget.cliente?.correos?.some((correo: any) =>
          correo.correo?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        statusFilter === "all" || budget.estado === statusFilter;
      const matchesClient =
        clientFilter === "all" || budget.clienteId?.toString() === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortField === "claveObra") {
        aValue = a.obra?.clave || "";
        bValue = b.obra?.clave || "";
      } else if (sortField === "cliente") {
        aValue = a.cliente?.nombre || "";
        bValue = b.cliente?.nombre || "";
      } else if (sortField === "total") {
        aValue = Number(a.total) || 0;
        bValue = Number(b.total) || 0;
      } else if (
        sortField === "fechaSolicitud" ||
        sortField === "fechaInicio"
      ) {
        aValue = new Date(a[sortField]).getTime();
        bValue = new Date(b[sortField]).getTime();
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [
    budgets,
    searchTerm,
    statusFilter,
    clientFilter,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBudgets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBudgets = filteredAndSortedBudgets.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Functions for description expansion
  const toggleDescription = (budgetId: number) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(budgetId)) {
        newSet.delete(budgetId);
      } else {
        newSet.add(budgetId);
      }
      return newSet;
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "Sin descripción";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const shouldShowExpandButton = (text: string) => {
    if (!text) return false;

    // Mostrar botón si:
    // 1. Más de 20 caracteres Y más de 3 palabras (texto denso)
    // 2. O más de 40 caracteres (texto medio-largo)
    // 3. O contiene saltos de línea
    // 4. O más de 6 palabras (independientemente de caracteres)
    const wordCount = text.trim().split(/\s+/).length;
    const hasLineBreaks = text.includes("\n") || text.includes("\r");

    return (
      (text.length > 20 && wordCount >= 3) ||
      text.length > 40 ||
      hasLineBreaks ||
      wordCount > 6
    );
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Normalizar datos para la estructura del backend
      const normalizedData = {
        ...data,
        // Convertir IVA a decimal si viene como porcentaje
        iva: data.iva > 1 ? data.iva / 100 : data.iva,
        // Asegurar que los valores monetarios sean números
        subtotal: parseFloat(data.subtotal?.toString() || "0"),
        ivaMonto: parseFloat(data.ivaMonto?.toString() || "0"),
        total: parseFloat(data.total?.toString() || "0"),
        porcentajeAnticipo: data.porcentajeAnticipo
          ? parseFloat(data.porcentajeAnticipo?.toString())
          : null,
      };

      console.log("[BudgetsNew] Enviando datos normalizados:", normalizedData);

      const response = await fetch("/api/presupuestos", {
        method: "POST",
        body: JSON.stringify(normalizedData),
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Agregar credentials para autenticación
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Presupuesto Creado",
        description: "El presupuesto se ha creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/presupuestos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowForm(false);
    },
    onError: (error: Error) => {
      console.error("Error creating budget:", error);
      toast({
        title: "Error al crear presupuesto",
        description:
          error.message ||
          "No se pudo crear el presupuesto. Verifique los datos ingresados.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Normalizar datos para la estructura del backend
      const normalizedData = {
        ...data,
        // Convertir IVA a decimal si viene como porcentaje
        iva: data.iva > 1 ? data.iva / 100 : data.iva,
        // Asegurar que los valores monetarios sean números
        subtotal: parseFloat(data.subtotal?.toString() || "0"),
        ivaMonto: parseFloat(data.ivaMonto?.toString() || "0"),
        total: parseFloat(data.total?.toString() || "0"),
        porcentajeAnticipo: data.porcentajeAnticipo
          ? parseFloat(data.porcentajeAnticipo?.toString())
          : null,
      };

      console.log(
        "[BudgetsNew] Actualizando con datos normalizados:",
        normalizedData
      );

      const response = await fetch(`/api/presupuestos/${editingBudget?.id}`, {
        method: "PUT",
        body: JSON.stringify(normalizedData),
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Agregar credentials para autenticación
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Presupuesto Actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/presupuestos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setShowForm(false);
      setEditingBudget(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el presupuesto",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/presupuestos/${id}`, {
        method: "DELETE",
        credentials: "include", // Agregar credentials para autenticación
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Error ${response.status}: ${response.statusText}`
        );
      }
    },
    onSuccess: () => {
      toast({
        title: "Presupuesto Eliminado",
        description: "El presupuesto se ha eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/presupuestos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el presupuesto",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const handleSubmit = (data: any) => {
    if (editingBudget) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };
  const handleEdit = async (budget: any) => {
    try {
      console.log("[BudgetsNew] handleEdit called with budget:", budget);

      // Obtener los datos completos del presupuesto incluyendo detalles
      const response = await fetch(`/api/presupuestos/${budget.id}`);
      if (!response.ok) {
        throw new Error("Error al obtener el presupuesto");
      }
      const fullBudgetData = await response.json();
      console.log("[BudgetsNew] Full budget data for editing:", fullBudgetData);

      setEditingBudget(fullBudgetData);
      setShowForm(true);

      console.log(
        "[BudgetsNew] State updated - showForm: true, editingBudget set"
      );
    } catch (error) {
      console.error("[BudgetsNew] Error loading budget for editing:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el presupuesto para editar",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este presupuesto?")) {
      deleteMutation.mutate(id);
    }
  };

  // Función para abrir el modal de rechazo
  const handleOpenRejectModal = (budget: any) => {
    setRejectingBudget(budget);
    setRejectReason("");
    setCustomRejectReason("");
    setShowRejectModal(true);
  };

  // Función para confirmar el rechazo con razón
  const handleConfirmReject = () => {
    if (!rejectReason) {
      toast({
        title: "Razón requerida",
        description: "Por favor seleccione una razón para el rechazo",
        variant: "destructive",
      });
      return;
    }

    if (rejectReason === "otra" && !customRejectReason.trim()) {
      toast({
        title: "Descripción requerida",
        description: "Por favor describa la razón del rechazo",
        variant: "destructive",
      });
      return;
    }

    const finalReason =
      rejectReason === "otra" ? customRejectReason : rejectReason;

    updateStatusMutation.mutate({
      id: rejectingBudget.id,
      estado: "rechazado",
      razonRechazo: finalReason,
    });

    setShowRejectModal(false);
    setRejectingBudget(null);
    setRejectReason("");
    setCustomRejectReason("");
  };

  // Funciones para el modal de aprobación
  const handleOpenApprovalModal = (budget: any) => {
    setApprovingBudget(budget);
    setShowApprovalModal(true);
  };

  const handleConfirmApproval = (tipoAprobacion: TipoAprobacion) => {
    updateStatusMutation.mutate({
      id: approvingBudget.id,
      estado: "aprobado",
      tipoAprobacion,
    });

    setShowApprovalModal(false);
    setApprovingBudget(null);
  };

  const handleExportPDF = async (id: number) => {
    try {
      console.log(`[PDF] Iniciando exportación para presupuesto ${id}`);

      // Llamar al nuevo endpoint que genera PDF con servicio separado
      const response = await fetch(`/api/presupuestos/${id}/pdf`);

      if (!response.ok) {
        // Intentar obtener más detalles del error
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Error ${response.status}: ${
            errorData.message || "Error al generar PDF"
          }`
        );
      }

      // Obtener el PDF como blob
      const blob = await response.blob();

      // Verificar que el blob es válido
      if (blob.size === 0) {
        throw new Error("El PDF generado está vacío");
      }

      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);

      // Crear elemento de descarga temporal
      const a = document.createElement("a");
      a.href = url;
      a.download = `Presupuesto_${id}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();

      // Limpiar recursos
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`[PDF] Exportación completada exitosamente`);
      toast({
        title: "PDF Generado",
        description: "Documento profesional generado correctamente",
      });
    } catch (error: any) {
      console.error("Error al exportar PDF:", error);
      toast({
        title: "Error al generar PDF",
        description:
          error.message ||
          "No se pudo generar el archivo PDF. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handlePreviewPDF = (id: number) => {
    // Abrir la nueva página de preview en una nueva pestaña
    window.open(`/budgets/${id}/preview`, "_blank");
  };

  const handleBulkExport = async () => {
    if (selectedBudgets.length === 0) {
      toast({
        title: "Selección requerida",
        description: "Por favor seleccione al menos un presupuesto",
        variant: "destructive",
      });
      return;
    }

    for (const id of selectedBudgets) {
      await handleExportPDF(id);
    }
    setSelectedBudgets([]);
  };

  const handleSelectAll = () => {
    if (selectedBudgets.length === paginatedBudgets.length) {
      setSelectedBudgets([]);
    } else {
      setSelectedBudgets(paginatedBudgets.map((b) => b.id));
    }
  };

  // Mostrar auditoría (creador y última modificación) sin romper la tabla
  const handleShowAudit = (budget: any) => {
    const creador = budget?.usuario?.nombre || "-";
    const ultimo = budget?.ultimoUsuario?.nombre || creador || "-";
    toast({
      title: "Auditoría del presupuesto",
      description: `Creado por: ${creador} • Última modificación: ${ultimo}`,
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // 🔴 ESTADOS DE DATOS - Aplicando colores funcionales empresariales
  const getStatusBudget = (status: string) => {
    const statusConfig = {
      borrador: {
        label: "Borrador",
        color: BRAND_COLORS.textSecondary,
        bgColor: `${BRAND_COLORS.textSecondary}15`, // 15% opacidad
        icon: Edit,
      },
      enviado: {
        label: "Enviado",
        color: BRAND_COLORS.warning,
        bgColor: `${BRAND_COLORS.warning}15`,
        icon: Clock,
      },
      aprobado: {
        label: "Aprobado",
        color: BRAND_COLORS.success,
        bgColor: `${BRAND_COLORS.success}15`,
        icon: CheckCircle,
      },
      rechazado: {
        label: "Rechazado",
        color: BRAND_COLORS.error,
        bgColor: `${BRAND_COLORS.error}15`,
        icon: X,
      },
      finalizado: {
        label: "Finalizado",
        color: BRAND_COLORS.success,
        bgColor: `${BRAND_COLORS.success}15`,
        icon: Check,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.borrador;
    const Icon = config.icon;

    return (
      <div
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium"
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
        }}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      estado,
      razonRechazo,
      tipoAprobacion,
    }: {
      id: number;
      estado: string;
      razonRechazo?: string;
      tipoAprobacion?: TipoAprobacion;
    }) => {
      const updateData: any = { estado };
      if (razonRechazo) {
        updateData.razonRechazo = razonRechazo;
      }
      if (tipoAprobacion) {
        updateData.tipoAprobacion = tipoAprobacion;
      }

      const response = await fetch(`/api/presupuestos/${id}`, {
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
      queryClient.invalidateQueries({ queryKey: ["/api/presupuestos"] });
    },
  });

  // Form view
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {editingBudget
                  ? "Modificar presupuesto existente - Los datos de la obra se mantienen"
                  : "Crear nuevo presupuesto con ID de obra automático"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingBudget(null);
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Lista
          </Button>
        </div>

        {/* Debug info for editing budget */}
        {editingBudget && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Debug - editingBudget:</strong> ID: {editingBudget.id} |
            Detalles: {editingBudget.detalles?.length || "N/A"} | Cliente:{" "}
            {editingBudget.clienteId || "N/A"}
          </div>
        )}

        <AdvancedBudgetForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
          initialData={editingBudget}
        />
      </div>
    );
  }

  // Main list view
  return (
    <div
      className="space-y-6"
      style={{
        backgroundColor: BRAND_COLORS.backgroundLight,
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* 🔴 HEADER/ENCABEZADO - Aplicando paleta empresarial */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText
            className="h-8 w-8"
            style={{ color: BRAND_COLORS.primary }}
          />
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              Gestión de Presupuestos
            </h1>
            <p style={{ color: BRAND_COLORS.textSecondary }}>
              Administre presupuestos, obras y estimaciones del laboratorio
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleBulkExport}
            variant="outline"
            disabled={selectedBudgets.length === 0}
            className="flex items-center space-x-2"
            style={{
              borderColor: BRAND_COLORS.textSecondary,
              color:
                selectedBudgets.length === 0
                  ? BRAND_COLORS.textSecondary
                  : BRAND_COLORS.textPrimary,
            }}
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar Seleccionados ({selectedBudgets.length})</span>
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
            <span>Crear Nuevo Presupuesto</span>
          </Button>
        </div>
      </div>

      {/* 🔴 TARJETAS - Aplicando fondos y estructura */}
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
                placeholder="Buscar por clave, cliente, descripción, teléfono, correo..."
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
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
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
              <span>Cargando presupuestos...</span>
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
                filteredAndSortedBudgets.length
              )}{" "}
              de {filteredAndSortedBudgets.length} presupuestos
            </p>
            {filteredAndSortedBudgets.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    selectedBudgets.length === paginatedBudgets.length &&
                    paginatedBudgets.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">
                  Seleccionar todos en esta página
                </Label>
              </div>
            )}
          </div>

          {/* Table */}
          {/* 🔴 TABLAS - Aplicando estructura de colores empresariales */}
          {filteredAndSortedBudgets.length > 0 ? (
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
                              selectedBudgets.length ===
                                paginatedBudgets.length &&
                              paginatedBudgets.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-32"
                          onClick={() => handleSort("claveObra")}
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <Hash
                              className="h-4 w-4"
                              style={{ color: BRAND_COLORS.primary }}
                            />
                            <span>Clave de Obra</span>
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
                          className="w-32"
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <CheckCircle
                              className="h-4 w-4"
                              style={{ color: BRAND_COLORS.primary }}
                            />
                            <span>Tipo Aprobación</span>
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-28"
                          onClick={() => handleSort("fechaSolicitud")}
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
                        {/* Columna de Usuarios eliminada para no romper el layout; la auditoría se muestra en Acciones */}
                        <TableHead
                          className="cursor-pointer hover:opacity-75 transition-opacity w-32"
                          onClick={() => handleSort("total")}
                          style={{ color: BRAND_COLORS.textPrimary }}
                        >
                          <div className="flex items-center space-x-1">
                            <span>Total</span>
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
                      {paginatedBudgets.map((budget) => (
                        <TableRow
                          key={budget.id}
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
                              checked={selectedBudgets.includes(budget.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBudgets([
                                    ...selectedBudgets,
                                    budget.id,
                                  ]);
                                } else {
                                  setSelectedBudgets(
                                    selectedBudgets.filter(
                                      (id) => id !== budget.id
                                    )
                                  );
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {budget.obra?.clave ? (
                              <span style={{ color: BRAND_COLORS.textPrimary }}>
                                {budget.obra.clave}
                              </span>
                            ) : (
                              <span
                                style={{ color: BRAND_COLORS.textSecondary }}
                              >
                                Sin asignar
                              </span>
                            )}
                          </TableCell>
                          {/* Celda de Usuarios eliminada; se traslada al menú Acciones */}
                          <TableCell>
                            <div>
                              <p
                                className="font-medium"
                                style={{ color: BRAND_COLORS.textPrimary }}
                              >
                                {budget.cliente?.nombre || "Sin cliente"}
                              </p>
                              {/* Mostrar teléfonos del cliente */}
                              {budget.cliente?.telefonos?.length > 0 && (
                                <p
                                  className="text-xs"
                                  style={{ color: BRAND_COLORS.textSecondary }}
                                >
                                  📞 {budget.cliente.telefonos[0].telefono}
                                  {budget.cliente.telefonos.length > 1 &&
                                    ` (+${
                                      budget.cliente.telefonos.length - 1
                                    })`}
                                </p>
                              )}
                              {/* Mostrar correos del cliente */}
                              {budget.cliente?.correos?.length > 0 && (
                                <p
                                  className="text-xs"
                                  style={{ color: BRAND_COLORS.textSecondary }}
                                >
                                  📧 {budget.cliente.correos[0].correo}
                                  {budget.cliente.correos.length > 1 &&
                                    ` (+${budget.cliente.correos.length - 1})`}
                                </p>
                              )}
                              <p
                                className="text-sm"
                                style={{ color: BRAND_COLORS.textSecondary }}
                              >
                                {budget.nombreContratista}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="w-80">
                            <div className="relative">
                              <div
                                className={`text-sm py-2 transition-all duration-300 ${
                                  expandedDescriptions.has(budget.id)
                                    ? "max-h-none"
                                    : "max-h-10 overflow-hidden"
                                }`}
                                style={{
                                  color: BRAND_COLORS.textPrimary,
                                  wordBreak: "break-word",
                                  whiteSpace: "normal",
                                  lineHeight: "1.4",
                                  display: expandedDescriptions.has(budget.id)
                                    ? "block"
                                    : "-webkit-box",
                                  WebkitLineClamp: expandedDescriptions.has(
                                    budget.id
                                  )
                                    ? "none"
                                    : 2,
                                  WebkitBoxOrient: "vertical" as any,
                                }}
                              >
                                {budget.obra?.descripcion || "Sin descripción"}
                              </div>
                              {shouldShowExpandButton(
                                budget.obra?.descripcion
                              ) && (
                                <button
                                  onClick={() => toggleDescription(budget.id)}
                                  className="flex items-center space-x-1 text-xs mt-2 px-3 py-1.5 rounded-md border transition-all duration-200 hover:shadow-sm"
                                  style={{
                                    color: BRAND_COLORS.primary,
                                    borderColor: BRAND_COLORS.border,
                                    backgroundColor: expandedDescriptions.has(
                                      budget.id
                                    )
                                      ? BRAND_COLORS.backgroundLight
                                      : BRAND_COLORS.white,
                                  }}
                                >
                                  <span className="font-medium">
                                    {expandedDescriptions.has(budget.id)
                                      ? "Mostrar menos"
                                      : "Mostrar más"}
                                  </span>
                                  <ChevronDown
                                    className={`h-3 w-3 transition-transform duration-200 ${
                                      expandedDescriptions.has(budget.id)
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBudget(budget.estado)}
                          </TableCell>
                          <TableCell
                            className="text-sm"
                            style={{ color: BRAND_COLORS.textSecondary }}
                          >
                            {budget.estado === "aprobado" && budget.tipoAprobacion ? (
                              <Badge
                                variant={budget.tipoAprobacion === "cliente" ? "default" : "secondary"}
                                className="text-xs"
                                style={{
                                  backgroundColor: budget.tipoAprobacion === "cliente" 
                                    ? "#E3F2FD" : "#F3E5F5",
                                  color: budget.tipoAprobacion === "cliente" 
                                    ? "#1976D2" : "#7B1FA2",
                                  border: `1px solid ${budget.tipoAprobacion === "cliente" 
                                    ? "#BBDEFB" : "#E1BEE7"}`
                                }}
                              >
                                <div className="flex items-center space-x-1">
                                  {budget.tipoAprobacion === "cliente" ? (
                                    <User className="h-3 w-3" />
                                  ) : (
                                    <Building className="h-3 w-3" />
                                  )}
                                  <span>
                                    {budget.tipoAprobacion === "cliente" ? "Cliente" : "Interno"}
                                  </span>
                                </div>
                              </Badge>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell
                            className="text-sm"
                            style={{ color: BRAND_COLORS.textSecondary }}
                          >
                            {budget.fechaSolicitud
                              ? format(
                                  new Date(budget.fechaSolicitud),
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
                            {Number(budget.total || 0).toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2 py-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExportPDF(budget.id)}
                                title="Exportar PDF"
                                className="hover:bg-blue-50"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePreviewPDF(budget.id)}
                                title="Previsualizar PDF"
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
                                      onClick={() => handleShowAudit(budget)}
                                    >
                                      <User className="h-4 w-4 mr-2" />
                                      Ver auditoría
                                    </DropdownMenuItem>
                                  )}
                                  {usuario?.rol === "admin" && (
                                    <DropdownMenuSeparator />
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(budget)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar Conceptos
                                  </DropdownMenuItem>
                                  {budget.estado === "borrador" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateStatusMutation.mutate({
                                          id: budget.id,
                                          estado: "enviado",
                                        })
                                      }
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Enviar para Aprobación
                                    </DropdownMenuItem>
                                  )}
                                  {budget.estado === "enviado" && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleOpenApprovalModal(budget)
                                        }
                                      >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Aprobar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleOpenRejectModal(budget)
                                        }
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Rechazar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {(budget.estado === "aprobado" ||
                                    budget.estado === "rechazado") && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        updateStatusMutation.mutate({
                                          id: budget.id,
                                          estado: "finalizado",
                                        })
                                      }
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Finalizar
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  {(budget.estado === "finalizado" ||
                                    budget.estado === "rechazado") && (
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(budget.id)}
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
                    </TableBody>{" "}
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
                <FileText
                  className="h-16 w-16 mx-auto mb-4"
                  style={{ color: BRAND_COLORS.textSecondary }}
                />
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  No se encontraron presupuestos
                </h3>
                <p
                  className="mb-6"
                  style={{ color: BRAND_COLORS.textSecondary }}
                >
                  {searchTerm ||
                  statusFilter !== "all" ||
                  clientFilter !== "all"
                    ? "Intente ajustar los filtros para encontrar presupuestos"
                    : "Cree su primer presupuesto para comenzar"}
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
                  Crear Primer Presupuesto
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

      {/* 🔴 MODAL DE RECHAZO - Aplicando colores funcionales */}
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
              <span>Rechazar Presupuesto</span>
            </DialogTitle>
            <DialogDescription style={{ color: BRAND_COLORS.textSecondary }}>
              Seleccione la razón por la cual se rechaza este presupuesto:
              <strong
                className="block mt-1"
                style={{ color: BRAND_COLORS.textPrimary }}
              >
                {rejectingBudget?.claveObra || "Sin clave"} -{" "}
                {rejectingBudget?.cliente?.nombre || "Sin cliente"}
              </strong>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label
                className="text-base font-medium"
                style={{ color: BRAND_COLORS.textPrimary }}
              >
                Motivo del rechazo:
              </Label>

              <div className="space-y-2">
                <label
                  className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value="no_anticipo"
                    checked={rejectReason === "no_anticipo"}
                    onChange={(e) => setRejectReason(e.target.value)}
                    style={{ accentColor: BRAND_COLORS.error }}
                  />
                  <span>
                    Esta obra se rechaza porque el cliente no dio anticipo
                  </span>
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
                  <span>Esta obra se rechaza por problemas del cliente</span>
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
                    placeholder="Escriba el motivo del rechazo..."
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
                Rechazar Presupuesto
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Aprobación */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onConfirm={handleConfirmApproval}
        budget={approvingBudget}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
