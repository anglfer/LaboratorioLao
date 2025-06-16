import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../shared/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../shared/components/ui/dialog";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../shared/components/ui/select";
import { Checkbox } from "../../../shared/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../shared/components/ui/dropdown-menu";
import { useToast } from "../../../shared/hooks/use-toast";
import AdvancedBudgetForm from "../components/AdvancedBudgetForm";
import { 
  FileText, Plus, Edit, Eye, Calendar, MapPin, User, Download, CheckCircle, 
  Clock, AlertCircle, Search, Filter, MoreHorizontal, FileDown, Copy,
  Trash2, Calendar as CalendarIcon, Building, Hash, ChevronLeft, ChevronRight,
  CheckSquare, X, Check, AlertTriangle, RefreshCw, ArrowUpDown
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch budgets data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/presupuestos'],
    queryFn: async () => {
      const response = await fetch('/api/presupuestos');
      if (!response.ok) throw new Error('Failed to fetch presupuestos');
      return response.json();
    },
  });
  const budgets: any[] = Array.isArray(data) ? data : [];

  // Fetch clients for filter dropdown
  const { data: clients } = useQuery({
    queryKey: ['/api/clientes'],
    queryFn: async () => {
      const response = await fetch('/api/clientes');
      if (!response.ok) throw new Error('Failed to fetch clientes');
      return response.json();
    },
  });

  // Filtered and sorted budgets
  const filteredAndSortedBudgets = useMemo(() => {
    let filtered = budgets.filter(budget => {
      const matchesSearch = !searchTerm || 
        budget.claveObra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.descripcionObra?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.nombreContratista?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || budget.estado === statusFilter;
      const matchesClient = clientFilter === "all" || budget.clienteId?.toString() === clientFilter;
      
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
      } else if (sortField === "fechaSolicitud" || sortField === "fechaInicio") {
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
  }, [budgets, searchTerm, statusFilter, clientFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedBudgets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBudgets = filteredAndSortedBudgets.slice(startIndex, startIndex + itemsPerPage);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/presupuestos', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Presupuesto Creado",
        description: "El presupuesto se ha creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setShowForm(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear el presupuesto. Verifique los datos ingresados.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/presupuestos/${editingBudget?.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Presupuesto Actualizado",
        description: "Los cambios se han guardado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
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
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
    },
    onSuccess: () => {
      toast({
        title: "Presupuesto Eliminado",
        description: "El presupuesto se ha eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
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
  };  const handleEdit = async (budget: any) => {
    try {
      console.log('[BudgetsNew] handleEdit called with budget:', budget);
      
      // Obtener los datos completos del presupuesto incluyendo detalles
      const response = await fetch(`/api/presupuestos/${budget.id}`);
      if (!response.ok) {
        throw new Error('Error al obtener el presupuesto');
      }
      const fullBudgetData = await response.json();
      console.log('[BudgetsNew] Full budget data for editing:', fullBudgetData);
      
      setEditingBudget(fullBudgetData);
      setShowForm(true);
      
      console.log('[BudgetsNew] State updated - showForm: true, editingBudget set');
    } catch (error) {
      console.error('[BudgetsNew] Error loading budget for editing:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el presupuesto para editar",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este presupuesto?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExportPDF = async (id: number) => {
    try {
      // Obtener información del presupuesto
      const presRes = await fetch(`/api/presupuestos/${id}`);
      const presupuesto = await presRes.json();

      if (!presupuesto) {
        throw new Error("Presupuesto no encontrado");
      }

      // Generar PDF
      const response = await fetch(`/api/presupuestos/${id}/pdf`);
      if (!response.ok) {
        throw new Error("Error al generar el PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laboratorio-${new Date().getFullYear()}-${
        presupuesto.claveObra
      }-A.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      alert(
        "Ocurrió un error al exportar el PDF. Inténtalo de nuevo más tarde."
      );
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
      setSelectedBudgets(paginatedBudgets.map(b => b.id));
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      borrador: { label: "Borrador", variant: "secondary", icon: Edit },
      enviado: { label: "Enviado", variant: "default", icon: Clock },
      aprobado: { label: "Aprobado", variant: "success", icon: CheckCircle },
      rechazado: { label: "Rechazado", variant: "destructive", icon: X },
      finalizado: { label: "Finalizado", variant: "success", icon: Check },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.borrador;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, estado }: { id: number, estado: string }) => {
      const response = await fetch(`/api/presupuestos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ estado }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/presupuestos'] });
    },
  });

  // Form view
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {editingBudget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {editingBudget ? 'Modificar presupuesto existente - Los datos de la obra se mantienen' : 'Crear nuevo presupuesto con ID de obra automático'}
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
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            <strong>Debug - editingBudget:</strong> ID: {editingBudget.id} | 
            Detalles: {editingBudget.detalles?.length || 'N/A'} | 
            Cliente: {editingBudget.clienteId || 'N/A'}
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestión de Presupuestos</h1>
            <p className="text-slate-600 dark:text-slate-400">
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
          >
            <FileDown className="h-4 w-4" />
            <span>Exportar Seleccionados ({selectedBudgets.length})</span>
          </Button>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Nuevo Presupuesto</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros y Búsqueda</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por clave, cliente, descripción..."
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
              Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredAndSortedBudgets.length)} de {filteredAndSortedBudgets.length} presupuestos
            </p>
            {filteredAndSortedBudgets.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedBudgets.length === paginatedBudgets.length && paginatedBudgets.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">Seleccionar todos en esta página</Label>
              </div>
            )}
          </div>

          {/* Table */}
          {filteredAndSortedBudgets.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedBudgets.length === paginatedBudgets.length && paginatedBudgets.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('claveObra')}>
                        <div className="flex items-center space-x-1">
                          <Hash className="h-4 w-4" />
                          <span>Clave de Obra</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('cliente')}>
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>Cliente</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('estado')}>
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>Estado</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('fechaSolicitud')}>
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Creado</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('total')}>
                        <div className="flex items-center space-x-1">
                          <span>Total</span>
                          <ArrowUpDown className="h-3 w-3" />
                        </div>
                      </TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBudgets.map((budget) => (
                      <TableRow key={budget.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedBudgets.includes(budget.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedBudgets([...selectedBudgets, budget.id]);
                              } else {
                                setSelectedBudgets(selectedBudgets.filter(id => id !== budget.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {budget.claveObra || <span className="text-gray-400">Sin asignar</span>}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{budget.cliente?.nombre || 'Sin cliente'}</p>
                            <p className="text-sm text-slate-500">{budget.nombreContratista}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm truncate max-w-xs" title={budget.descripcionObra}>
                            {budget.descripcionObra || 'Sin descripción'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(budget.estado)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {budget.fechaSolicitud ? format(new Date(budget.fechaSolicitud), 'dd/MM/yyyy', { locale: es }) : '-'}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${Number(budget.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportPDF(budget.id)}
                              title="Exportar PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleEdit(budget)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar Conceptos
                                </DropdownMenuItem>
                                {budget.estado === 'borrador' && (
                                  <DropdownMenuItem 
                                    onClick={() => updateStatusMutation.mutate({ id: budget.id, estado: 'enviado' })}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Enviar para Aprobación
                                  </DropdownMenuItem>
                                )}
                                {budget.estado === 'enviado' && (
                                  <>
                                    <DropdownMenuItem 
                                      onClick={() => updateStatusMutation.mutate({ id: budget.id, estado: 'aprobado' })}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Aprobar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => updateStatusMutation.mutate({ id: budget.id, estado: 'rechazado' })}
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Rechazar
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {(budget.estado === 'aprobado' || budget.estado === 'rechazado') && (
                                  <DropdownMenuItem 
                                    onClick={() => updateStatusMutation.mutate({ id: budget.id, estado: 'finalizado' })}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Finalizar
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {(budget.estado === 'finalizado' || budget.estado === 'rechazado') && (
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
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No se encontraron presupuestos
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  {searchTerm || statusFilter !== "all" || clientFilter !== "all" 
                    ? "Intente ajustar los filtros para encontrar presupuestos" 
                    : "Cree su primer presupuesto para comenzar"}
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
