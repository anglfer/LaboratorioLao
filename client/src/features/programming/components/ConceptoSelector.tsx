import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../shared/components/ui/tooltip";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  FileText,
  Search,
  Check,
} from "lucide-react";
import { Badge } from "../../../shared/components/ui/badge";

// Types para el selector
interface ConceptoJerarquico {
  id: number;
  codigo: string;
  descripcion: string;
  unidad: string;
  precioUnitario: string;
  areaId: number;
}

interface AreaJerarquica {
  id: number;
  codigo: string;
  nombre: string;
  padreId?: number | null;
  nivel: number;
  expanded?: boolean;
  hijos?: AreaJerarquica[];
  conceptos?: ConceptoJerarquico[];
}

interface ConceptoSelectorProps {
  onSelect: (concepto: ConceptoJerarquico) => void;
  selectedConcepto?: ConceptoJerarquico;
  trigger?: React.ReactNode;
}

export default function ConceptoSelector({
  onSelect,
  selectedConcepto,
  trigger,
}: ConceptoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [arbol, setArbol] = useState<AreaJerarquica[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Cargar datos del árbol jerárquico
  useEffect(() => {
    const fetchArbol = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/areas-jerarquicas/arbol");
        if (!response.ok) throw new Error("Error al cargar árbol");
        const result = await response.json();
        setArbol(result.data || []);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchArbol();
    }
  }, [open]);

  const toggleExpansion = (nodeId: number) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleSelectConcepto = (concepto: ConceptoJerarquico) => {
    onSelect(concepto);
    setOpen(false);
  };

  const filtrarArbol = (
    areas: AreaJerarquica[],
    term: string
  ): AreaJerarquica[] => {
    if (!term) return areas;

    const filtrarRecursivo = (areas: AreaJerarquica[]): AreaJerarquica[] => {
      return areas.reduce((acc: AreaJerarquica[], area) => {
        // Buscar en nombre del área
        const areaMatches =
          area.nombre.toLowerCase().includes(term.toLowerCase()) ||
          area.codigo.toLowerCase().includes(term.toLowerCase());

        // Buscar en conceptos
        const conceptoMatches = area.conceptos?.some(
          (concepto) =>
            concepto.descripcion.toLowerCase().includes(term.toLowerCase()) ||
            concepto.codigo.toLowerCase().includes(term.toLowerCase())
        );

        // Filtrar conceptos que coinciden
        const conceptosFiltrados =
          area.conceptos?.filter(
            (concepto) =>
              concepto.descripcion.toLowerCase().includes(term.toLowerCase()) ||
              concepto.codigo.toLowerCase().includes(term.toLowerCase())
          ) || [];

        // Buscar en hijos recursivamente
        const hijosFiltrados = area.hijos ? filtrarRecursivo(area.hijos) : [];

        if (areaMatches || conceptoMatches || hijosFiltrados.length > 0) {
          acc.push({
            ...area,
            conceptos: term ? conceptosFiltrados : area.conceptos,
            hijos: hijosFiltrados,
          });
        }

        return acc;
      }, []);
    };

    return filtrarRecursivo(areas);
  };

  const arbolFiltrado = filtrarArbol(arbol, searchTerm);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="w-full justify-start h-auto min-h-[3rem] px-3 py-2 text-left"
            type="button"
          >
            <div className="flex items-center space-x-2 flex-1 overflow-hidden">
              {selectedConcepto ? (
                <>
                  <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium truncate">
                      {selectedConcepto.codigo}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {selectedConcepto.descripcion}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    ✓
                  </Badge>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500 truncate">
                    Seleccionar concepto jerárquico...
                  </span>
                </>
              )}
            </div>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden z-50">
        <DialogHeader>
          <DialogTitle>Seleccionar Concepto Jerárquico</DialogTitle>
          <DialogDescription>
            Navegue por el árbol jerárquico para seleccionar un concepto
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 h-full">
          {/* Búsqueda */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 z-10" />
            <Input
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Árbol */}
          <div className="flex-1 border rounded-lg bg-white">
            <div className="h-96 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p>Cargando conceptos...</p>
                  </div>
                </div>
              ) : arbolFiltrado.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">
                      {searchTerm
                        ? "No se encontraron resultados"
                        : "No hay conceptos disponibles"}
                    </p>
                    {searchTerm && (
                      <p className="text-sm mt-1">
                        Intente con otros términos de búsqueda
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  {arbolFiltrado.map((area) => (
                    <AreaNode
                      key={area.id}
                      area={area}
                      nivel={0}
                      expandedNodes={expandedNodes}
                      onToggleExpansion={toggleExpansion}
                      onSelectConcepto={handleSelectConcepto}
                      selectedConcepto={selectedConcepto}
                      searchTerm={searchTerm}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Componente para cada nodo del área
interface AreaNodeProps {
  area: AreaJerarquica;
  nivel: number;
  expandedNodes: Set<number>;
  onToggleExpansion: (id: number) => void;
  onSelectConcepto: (concepto: ConceptoJerarquico) => void;
  selectedConcepto?: ConceptoJerarquico;
  searchTerm: string;
}

function AreaNode({
  area,
  nivel,
  expandedNodes,
  onToggleExpansion,
  onSelectConcepto,
  selectedConcepto,
  searchTerm,
}: AreaNodeProps) {
  const isExpanded = expandedNodes.has(area.id);
  const tieneHijos =
    (area.hijos && area.hijos.length > 0) ||
    (area.conceptos && area.conceptos.length > 0);
  const paddingLeft = nivel * 20;

  const filtrarConceptos = (conceptos: ConceptoJerarquico[]) => {
    if (!searchTerm) return conceptos;
    return conceptos.filter(
      (concepto) =>
        concepto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concepto.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const conceptosFiltrados = area.conceptos
    ? filtrarConceptos(area.conceptos)
    : [];

  return (
    <div>
      {/* Nodo del área */}
      <div
        className="flex items-center py-2 px-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors duration-150 group"
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
        onClick={() => tieneHijos && onToggleExpansion(area.id)}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {tieneHijos ? (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
              )}
            </div>
          ) : (
            <div className="w-4 flex-shrink-0" />
          )}

          <div className="flex-shrink-0">
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-600" />
            ) : (
              <Folder className="h-4 w-4 text-blue-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-medium text-gray-700 text-sm truncate block">
              {area.codigo} - {area.nombre}
            </span>
          </div>

          {conceptosFiltrados.length > 0 && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {conceptosFiltrados.length} conceptos
            </Badge>
          )}
        </div>
      </div>

      {/* Conceptos del área */}
      {isExpanded &&
        conceptosFiltrados.map((concepto) => (
          <div
            key={concepto.id}
            className={`flex items-center py-3 px-3 hover:bg-blue-50 rounded-md cursor-pointer border-l-2 ml-6 my-1 transition-all duration-150 ${
              selectedConcepto?.id === concepto.id
                ? "bg-blue-50 border-blue-500 shadow-sm"
                : "border-transparent hover:border-blue-200"
            }`}
            style={{ paddingLeft: `${paddingLeft + 24}px` }}
            onClick={() => onSelectConcepto(concepto)}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {concepto.descripcion}
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  <span className="font-mono">{concepto.codigo}</span> •{" "}
                  {concepto.unidad} •
                  <span className="font-semibold text-green-600">
                    ${concepto.precioUnitario}
                  </span>
                </div>
              </div>
              {selectedConcepto?.id === concepto.id && (
                <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}

      {/* Hijos del área */}
      {isExpanded &&
        area.hijos?.map((hijo) => (
          <AreaNode
            key={hijo.id}
            area={hijo}
            nivel={nivel + 1}
            expandedNodes={expandedNodes}
            onToggleExpansion={onToggleExpansion}
            onSelectConcepto={onSelectConcepto}
            selectedConcepto={selectedConcepto}
            searchTerm={searchTerm}
          />
        ))}
    </div>
  );
}
