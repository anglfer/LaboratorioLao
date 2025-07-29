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
// Importaciones para jsPDF
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

export default function BudgetsNew() {
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
        budget.claveObra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.cliente?.nombre
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        budget.descripcionObra
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
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "cliente") {
        aValue = a.cliente?.nombre || "";
        bValue = b.cliente?.nombre || "";
      } else if (sortField === "total") {
        aValue = Number(a.total) || 0;
        bValue = Number(b.total) || 0;
      } else if (
        sortField === "fechaSolicitud" ||
        sortField === "fechaInicio"
      ) {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
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
      const response = await fetch("/api/presupuestos", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
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
      const response = await fetch(`/api/presupuestos/${editingBudget?.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
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
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
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

  const handleExportPDF = async (id: number) => {
    try {
      console.log(`[PDF] Iniciando exportación para presupuesto ${id}`);

      // Obtener información del presupuesto con detalles
      const presRes = await fetch(`/api/presupuestos/${id}`);
      if (!presRes.ok) {
        throw new Error(`Error al obtener presupuesto: ${presRes.status}`);
      }
      const presupuesto = await presRes.json();

      if (!presupuesto) {
        throw new Error("Presupuesto no encontrado");
      }

      console.log(`[PDF] Presupuesto obtenido:`, presupuesto.claveObra);

      // Generar PDF profesional y vinculante
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      const margin = 15;

      // Colores corporativos LAO
      const laoGreen = [139, 195, 74];
      const darkGray = [64, 64, 64];
      const lightGray = [128, 128, 128];
      const accentBlue = [41, 128, 185];

      // Helper function para convertir número a letras (implementación básica)
      const numeroALetras = (num: number): string => {
        // Implementación básica - se puede expandir
        const unidades = [
          "",
          "UNO",
          "DOS",
          "TRES",
          "CUATRO",
          "CINCO",
          "SEIS",
          "SIETE",
          "OCHO",
          "NUEVE",
        ];
        const decenas = [
          "",
          "",
          "VEINTE",
          "TREINTA",
          "CUARENTA",
          "CINCUENTA",
          "SESENTA",
          "SETENTA",
          "OCHENTA",
          "NOVENTA",
        ];
        const centenas = [
          "",
          "CIENTO",
          "DOSCIENTOS",
          "TRESCIENTOS",
          "CUATROCIENTOS",
          "QUINIENTOS",
          "SEISCIENTOS",
          "SETECIENTOS",
          "OCHOCIENTOS",
          "NOVECIENTOS",
        ];

        if (num === 0) return "CERO PESOS 00/100 M.N.";
        if (num >= 1000000)
          return `${Math.floor(num / 1000000)} MILLÓN${
            Math.floor(num / 1000000) > 1 ? "ES" : ""
          } ${numeroALetras(num % 1000000)}`.trim();
        if (num >= 1000)
          return `${numeroALetras(Math.floor(num / 1000))} MIL ${numeroALetras(
            num % 1000
          )}`.trim();
        if (num >= 100)
          return `${centenas[Math.floor(num / 100)]} ${numeroALetras(
            num % 100
          )}`.trim();
        if (num >= 20)
          return `${decenas[Math.floor(num / 10)]} ${
            unidades[num % 10]
          }`.trim();
        if (num >= 10)
          return [
            "DIEZ",
            "ONCE",
            "DOCE",
            "TRECE",
            "CATORCE",
            "QUINCE",
            "DIECISÉIS",
            "DIECISIETE",
            "DIECIOCHO",
            "DIECINUEVE",
          ][num - 10];
        return unidades[num];
      };

      let yPos = margin;

      // =============================================
      // 5.8.2 ENCABEZADO CORPORATIVO
      // =============================================

      // Logo y header corporativo
      pdf.setFillColor(laoGreen[0], laoGreen[1], laoGreen[2]);
      pdf.rect(margin, yPos, 50, 18, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("LAO", margin + 5, yPos + 12);

      // Información de contacto corporativo
      pdf.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      const contactInfo = [
        "LABORATORIO Y CONSULTORIA LOA S.A. de C.V.",
        "RFC: LOA940429-QR8 (PENDIENTE VERIFICAR)",
        "AVE. DE LA PRESA 511 B, IBARRILLA, GTO. C.P. 37080",
        "TEL: 01 477 2102263 / 01 477 3112205",
        "EMAIL: recepcion@loalaboratorio.com",
        "WEB: www.loalaboratorio.com",
      ];

      let contactY = yPos + 2;
      contactInfo.forEach((info, index) => {
        pdf.setFont("helvetica", index === 0 ? "bold" : "normal");
        pdf.setFontSize(index === 0 ? 8 : 7);
        pdf.text(info, pageWidth - margin, contactY, { align: "right" });
        contactY += index === 0 ? 5 : 3;
      });

      yPos += 25;
      // Título principal del documento
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.text("PROPUESTA DE SERVICIOS DE LABORATORIO", pageWidth / 2, yPos, {
        align: "center",
      });

      yPos += 8;
      pdf.setFontSize(14);
      pdf.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      pdf.text("DOCUMENTO VINCULANTE", pageWidth / 2, yPos, {
        align: "center",
      });

      yPos += 15;

      // Clave de obra prominente
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 12, "F");
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(
        `CLAVE DE OBRA: ${presupuesto.claveObra || "SIN ASIGNAR"}`,
        margin + 5,
        yPos + 8
      );

      // Fecha de generación
      const fechaGeneracion = new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      pdf.text(`FECHA: ${fechaGeneracion}`, pageWidth - margin - 5, yPos + 8, {
        align: "right",
      });

      yPos += 20;

      // =============================================
      // 5.8.3 INFORMACIÓN DEL CLIENTE Y PROYECTO
      // =============================================

      // Datos del Cliente
      pdf.setFillColor(laoGreen[0], laoGreen[1], laoGreen[2]);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
      pdf.text("INFORMACIÓN DEL CLIENTE", margin + 3, yPos + 5);

      yPos += 12;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      const clienteData = [
        {
          label: "DIRIGIDO A:",
          value: presupuesto.cliente?.nombre || "Sin especificar",
        },
        {
          label: "ATENCIÓN:",
          value: presupuesto.contactoResponsable || "Sin especificar",
        },
        {
          label: "RESPONSABLE DE OBRA:",
          value: presupuesto.nombreContratista || "Sin especificar",
        },
      ];

      clienteData.forEach((item) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, margin, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.text(item.value, margin + 40, yPos);
        yPos += 6;
      });

      // Dirección del cliente
      if (presupuesto.cliente?.direccion) {
        pdf.setFont("helvetica", "bold");
        pdf.text("DIRECCIÓN:", margin, yPos);
        pdf.setFont("helvetica", "normal");
        pdf.text(presupuesto.cliente.direccion, margin + 40, yPos);
        yPos += 6;
      }

      // Teléfonos
      if (presupuesto.cliente?.telefonos?.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text("TELÉFONOS:", margin, yPos);
        pdf.setFont("helvetica", "normal");
        const telefonos = presupuesto.cliente.telefonos
          .map((t: any) => t.telefono)
          .join(", ");
        pdf.text(telefonos, margin + 40, yPos);
        yPos += 6;
      }

      // Correos
      if (presupuesto.cliente?.correos?.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.text("CORREOS:", margin, yPos);
        pdf.setFont("helvetica", "normal");
        const correos = presupuesto.cliente.correos
          .map((c: any) => c.correo)
          .join(", ");
        pdf.text(correos, margin + 40, yPos);
        yPos += 6;
      }

      yPos += 5;

      // Información del Proyecto
      pdf.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
      pdf.text("INFORMACIÓN DEL PROYECTO", margin + 3, yPos + 5);

      yPos += 12;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      const proyectoData = [
        {
          label: "DESCRIPCIÓN:",
          value: presupuesto.descripcionObra || "Sin especificar",
        },
        { label: "UBICACIÓN:", value: presupuesto.ubicacion || "Por definir" },
        {
          label: "FECHA SOLICITUD:",
          value: presupuesto.fechaSolicitud
            ? new Date(presupuesto.fechaSolicitud).toLocaleDateString("es-MX")
            : "Sin especificar",
        },
        {
          label: "FECHA INICIO PROPUESTA:",
          value: presupuesto.fechaInicio
            ? new Date(presupuesto.fechaInicio).toLocaleDateString("es-MX")
            : "Por acordar",
        },
      ];

      proyectoData.forEach((item) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, margin, yPos);
        pdf.setFont("helvetica", "normal");

        if (item.label === "DESCRIPCIÓN:" && item.value.length > 60) {
          const lines = pdf.splitTextToSize(
            item.value,
            pageWidth - margin - 50
          );
          pdf.text(lines, margin + 50, yPos);
          yPos += lines.length * 4;
        } else {
          pdf.text(item.value, margin + 50, yPos);
          yPos += 6;
        }
      });

      yPos += 10;

      // =============================================
      // 5.8.4 DESGLOSE DE SERVICIOS Y CONCEPTOS
      // =============================================

      // Verificar si necesitamos nueva página
      if (yPos > pageHeight - 100) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
      pdf.text("DESGLOSE DETALLADO DE SERVICIOS", margin + 3, yPos + 7);

      yPos += 15;

      // Tabla de conceptos
      if (presupuesto.detalles && presupuesto.detalles.length > 0) {
        // Headers de tabla
        const tableHeaders = [
          "No.",
          "DESCRIPCIÓN DEL SERVICIO",
          "UNIDAD",
          "CANTIDAD",
          "PRECIO UNIT.",
          "IMPORTE",
        ];
        const colWidths = [12, 85, 18, 20, 25, 25];
        let currentX = margin;

        // Dibujar headers
        pdf.setFillColor(220, 220, 220);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);

        tableHeaders.forEach((header, index) => {
          pdf.rect(currentX, yPos, colWidths[index], 8, "FD");
          pdf.text(header, currentX + 2, yPos + 5);
          currentX += colWidths[index];
        });

        yPos += 8;

        // Datos de la tabla
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);

        presupuesto.detalles.forEach((detalle: any, index: number) => {
          currentX = margin;
          const rowHeight = 12; // Altura aumentada para mejor legibilidad

          // Verificar si necesitamos nueva página
          if (yPos + rowHeight > pageHeight - 50) {
            pdf.addPage();
            yPos = margin;
          }

          // Alternar color de fondo para mejor legibilidad
          if (index % 2 === 0) {
            pdf.setFillColor(248, 248, 248);
            pdf.rect(margin, yPos, pageWidth - 2 * margin, rowHeight, "F");
          }

          // Número
          pdf.rect(currentX, yPos, colWidths[0], rowHeight, "D");
          pdf.text(
            (index + 1).toString(),
            currentX + colWidths[0] / 2,
            yPos + 6,
            { align: "center" }
          );
          currentX += colWidths[0];

          // Descripción
          pdf.rect(currentX, yPos, colWidths[1], rowHeight, "D");
          const descripcion =
            detalle.concepto?.descripcion || "Sin descripción";
          const descripcionLines = pdf.splitTextToSize(
            descripcion,
            colWidths[1] - 4
          );
          pdf.text(descripcionLines[0] || "", currentX + 2, yPos + 6);
          if (descripcionLines.length > 1) {
            pdf.setFontSize(6);
            pdf.text(descripcionLines[1] || "", currentX + 2, yPos + 9);
            pdf.setFontSize(7);
          }
          currentX += colWidths[1];

          // Unidad
          pdf.rect(currentX, yPos, colWidths[2], rowHeight, "D");
          pdf.text(
            detalle.concepto?.unidad || "-",
            currentX + colWidths[2] / 2,
            yPos + 6,
            { align: "center" }
          );
          currentX += colWidths[2];

          // Cantidad
          pdf.rect(currentX, yPos, colWidths[3], rowHeight, "D");
          pdf.text(
            Number(detalle.cantidad || 0).toFixed(2),
            currentX + colWidths[3] - 2,
            yPos + 6,
            { align: "right" }
          );
          currentX += colWidths[3];

          // Precio unitario
          pdf.rect(currentX, yPos, colWidths[4], rowHeight, "D");
          pdf.text(
            `$${Number(detalle.precioUnitario || 0).toLocaleString("es-MX", {
              minimumFractionDigits: 2,
            })}`,
            currentX + colWidths[4] - 2,
            yPos + 6,
            { align: "right" }
          );
          currentX += colWidths[4];

          // Importe
          pdf.rect(currentX, yPos, colWidths[5], rowHeight, "D");
          const importe =
            Number(detalle.cantidad || 0) * Number(detalle.precioUnitario || 0);
          pdf.text(
            `$${importe.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
            currentX + colWidths[5] - 2,
            yPos + 6,
            { align: "right" }
          );

          yPos += rowHeight;
        });
      }

      yPos += 10;

      // Totales
      const subtotal = Number(presupuesto.subtotal || 0);
      const iva = Number(presupuesto.ivaMonto || 0);
      const total = Number(presupuesto.total || 0);

      // Cuadro de totales
      const totalesX = pageWidth - 80;
      pdf.setFillColor(240, 240, 240);
      pdf.rect(totalesX - 5, yPos, 65, 25, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);

      // Subtotal
      pdf.text("SUBTOTAL:", totalesX, yPos + 6);
      pdf.text(
        `$${subtotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        pageWidth - margin,
        yPos + 6,
        { align: "right" }
      );

      // IVA
      pdf.text("IVA (16%):", totalesX, yPos + 12);
      pdf.text(
        `$${iva.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        pageWidth - margin,
        yPos + 12,
        { align: "right" }
      );

      // Total
      pdf.setFillColor(laoGreen[0], laoGreen[1], laoGreen[2]);
      pdf.setTextColor(255, 255, 255);
      pdf.rect(totalesX - 5, yPos + 16, 65, 8, "F");
      pdf.text("TOTAL:", totalesX, yPos + 22);
      pdf.text(
        `$${total.toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
        pageWidth - margin,
        yPos + 22,
        { align: "right" }
      );

      yPos += 30;

      // Cantidad en letras
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);

      const totalEnLetras = numeroALetras(Math.floor(total));
      const centavos = Math.round((total - Math.floor(total)) * 100);

      pdf.text("IMPORTE CON LETRA:", margin, yPos);
      yPos += 5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const cantidadLetras = `${totalEnLetras} PESOS ${centavos
        .toString()
        .padStart(2, "0")}/100 M.N.`;
      const letrasLines = pdf.splitTextToSize(
        cantidadLetras,
        pageWidth - 2 * margin
      );
      pdf.text(letrasLines, margin, yPos);

      yPos += letrasLines.length * 4 + 10;

      // =============================================
      // 5.8.5 RESUMEN EJECUTIVO POR SUBÁREAS
      // =============================================

      // Verificar si necesitamos nueva página
      if (yPos > pageHeight - 80) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFillColor(laoGreen[0], laoGreen[1], laoGreen[2]);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
      pdf.text("RESUMEN DE SERVICIOS POR ÁREA", margin + 3, yPos + 7);

      yPos += 15;

      // Ejemplo de áreas y subáreas (esto se puede extender según los datos reales)
      const areasServicios = [
        {
          area: "CONTROL DE CALIDAD (CC)",
          subareas: [
            "Agregados",
            "Concreto",
            "Asfalto",
            "Acero",
            "Mampostería",
          ],
          incluidas: ["Agregados", "Concreto"], // Las que están en el presupuesto
        },
        {
          area: "MECÁNICA DE SUELOS (MS)",
          subareas: [
            "Clasificación",
            "Compactación",
            "Resistencia",
            "Permeabilidad",
          ],
          incluidas: ["Clasificación"],
        },
      ];

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      areasServicios.forEach((area) => {
        pdf.setFont("helvetica", "bold");
        pdf.text(`• ${area.area}`, margin + 5, yPos);
        yPos += 6;

        area.subareas.forEach((subarea) => {
          const incluida = area.incluidas.includes(subarea);
          pdf.setFont("helvetica", incluida ? "bold" : "normal");
          pdf.setTextColor(
            incluida ? laoGreen[0] : lightGray[0],
            incluida ? laoGreen[1] : lightGray[1],
            incluida ? laoGreen[2] : lightGray[2]
          );
          pdf.text(
            `    ✓ ${subarea}${incluida ? " (INCLUIDO)" : ""}`,
            margin + 10,
            yPos
          );
          yPos += 4;
        });
        yPos += 3;
      });

      yPos += 10;

      // =============================================
      // 5.8.6 TÉRMINOS COMERCIALES Y LEGALES
      // =============================================

      // Verificar si necesitamos nueva página
      if (yPos > pageHeight - 120) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFillColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
      pdf.text("TÉRMINOS Y CONDICIONES COMERCIALES", margin + 3, yPos + 7);

      yPos += 15;

      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("CONDICIONES DE PAGO:", margin, yPos);

      yPos += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      const condicionesPago = [
        "• Forma de pago: Transferencia bancaria o efectivo",
        "• 50% de anticipo al firmar el contrato",
        "• 50% restante contra entrega de resultados",
        "• Los precios incluyen IVA",
        "• Vigencia de la propuesta: 30 días naturales",
      ];

      condicionesPago.forEach((condicion) => {
        pdf.text(condicion, margin + 5, yPos);
        yPos += 5;
      });

      yPos += 8;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("TÉRMINOS GENERALES:", margin, yPos);

      yPos += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);

      const terminosGenerales = [
        "• Los servicios se realizarán conforme a normas NMX y ASTM aplicables",
        "• Tiempo de entrega: 5-10 días hábiles según el tipo de ensayo",
        "• Las muestras deberán ser proporcionadas por el cliente",
        "• Los resultados se entregarán en formato digital y físico",
        "• Garantía: Respaldamos la calidad técnica de nuestros servicios",
        "• Política de cancelación: 48 horas de anticipación sin penalización",
      ];

      terminosGenerales.forEach((termino) => {
        const terminoLines = pdf.splitTextToSize(
          termino,
          pageWidth - 2 * margin - 10
        );
        pdf.text(terminoLines, margin + 5, yPos);
        yPos += terminoLines.length * 4 + 1;
      });

      yPos += 10;

      // =============================================
      // 5.8.7 CLÁUSULA LEGAL DE ACEPTACIÓN
      // =============================================

      pdf.setFillColor(255, 249, 196); // Fondo amarillo claro para destacar
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, "F");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("CLÁUSULA LEGAL DE ACEPTACIÓN:", margin + 3, yPos + 5);

      yPos += 8;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);

      const clausulaLegal =
        "La firma de este documento por parte del cliente implica la aceptación total de los términos y condiciones aquí establecidos, así como la autorización para la ejecución de los servicios descritos, constituyendo este presupuesto un acuerdo vinculante entre las partes.";

      const clausulaLines = pdf.splitTextToSize(
        clausulaLegal,
        pageWidth - 2 * margin - 6
      );
      pdf.text(clausulaLines, margin + 3, yPos);

      yPos += 30;

      // =============================================
      // 5.8.8 SECCIÓN DE FIRMAS
      // =============================================

      // Verificar si necesitamos nueva página para las firmas
      if (yPos > pageHeight - 60) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setFillColor(darkGray[0], darkGray[1], darkGray[2]);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.rect(margin, yPos, pageWidth - 2 * margin, 10, "F");
      pdf.text("SECCIÓN DE FIRMAS Y ACEPTACIÓN", margin + 3, yPos + 7);

      yPos += 20;

      // Área de firmas
      const firmaWidth = (pageWidth - 3 * margin) / 2;

      // Firma del Laboratorio (izquierda)
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("LABORATORIO Y CONSULTORIA LOA S.A. de C.V.", margin, yPos);

      yPos += 15;
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, yPos, margin + firmaWidth - 10, yPos); // Línea para firma

      yPos += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("NOMBRE: _________________________", margin, yPos);

      yPos += 6;
      pdf.text("CARGO: __________________________", margin, yPos);

      yPos += 6;
      pdf.text("FECHA: __________________________", margin, yPos);

      // Firma del Cliente (derecha)
      const clienteX = margin + firmaWidth + 10;
      yPos -= 27; // Volver arriba para alinear con firma del laboratorio

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("ACEPTACIÓN DEL CLIENTE", clienteX, yPos);

      yPos += 15;
      pdf.line(clienteX, yPos, clienteX + firmaWidth - 10, yPos); // Línea para firma

      yPos += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text("NOMBRE COMPLETO: ________________", clienteX, yPos);

      yPos += 6;
      pdf.text("CARGO/PUESTO: ___________________", clienteX, yPos);

      yPos += 6;
      pdf.text("FECHA DE ACEPTACIÓN: ____________", clienteX, yPos);

      yPos += 15;

      // Footer del documento
      pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.text(
        `Documento generado el ${fechaGeneracion} | Este documento tiene validez legal una vez firmado por ambas partes`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );

      // Descargar PDF
      const filename = `${presupuesto.claveObra || presupuesto.id}.pdf`;
      pdf.save(filename);

      console.log(`[PDF] Exportación completada exitosamente`);
      toast({
        title: "PDF Generado",
        description: "Propuesta profesional generada correctamente",
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
    }: {
      id: number;
      estado: string;
      razonRechazo?: string;
    }) => {
      const updateData: any = { estado };
      if (razonRechazo) {
        updateData.razonRechazo = razonRechazo;
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
                            {budget.claveObra ? (
                              <span style={{ color: BRAND_COLORS.textPrimary }}>
                                {budget.claveObra}
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
                                {budget.descripcionObra || "Sin descripción"}
                              </div>
                              {shouldShowExpandButton(
                                budget.descripcionObra
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
                                          updateStatusMutation.mutate({
                                            id: budget.id,
                                            estado: "aprobado",
                                          })
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
    </div>
  );
}
