import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Folder,
  FileText,
  AlertCircle,
  X,
  Upload,
  Download,
} from "lucide-react";
import ArbolJerarquico from "./ArbolJerarquico";
import FormularioArea from "./FormularioArea";
import FormularioConcepto from "./FormularioConcepto";
import ModalImportarConceptos from "./ModalImportarConceptos";
import ImportadorConceptos from "../utils/importadorConceptos";
import {
  ArbolCompleto,
  AreaJerarquica,
  ConceptoJerarquico,
  AreaJerarquicaForm,
  ConceptoJerarquicoForm,
} from "../types/conceptoJerarquico";
import { areasJerarquicasService } from "../services/areasJerarquicasService";
import { conceptosJerarquicosService } from "../services/conceptosJerarquicosService";

type ModalState =
  | { tipo: "cerrado" }
  | { tipo: "nueva-area"; padre?: AreaJerarquica }
  | { tipo: "editar-area"; area: AreaJerarquica }
  | { tipo: "nuevo-concepto"; area: AreaJerarquica }
  | {
      tipo: "editar-concepto";
      concepto: ConceptoJerarquico;
      area: AreaJerarquica;
    }
  | { tipo: "importar-conceptos" };

export const SistemaJerarquico: React.FC = () => {
  const [arbol, setArbol] = useState<ArbolCompleto[]>([]);
  const [todasLasAreas, setTodasLasAreas] = useState<AreaJerarquica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [areaSeleccionada, setAreaSeleccionada] = useState<
    number | undefined
  >();
  const [conceptoSeleccionado, setConceptoSeleccionado] = useState<
    number | undefined
  >();
  const [modal, setModal] = useState<ModalState>({ tipo: "cerrado" });
  const [guardando, setGuardando] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para extraer el estado de expansión del árbol actual
  const extraerEstadoExpansion = (
    nodos: ArbolCompleto[]
  ): Map<number, boolean> => {
    const estado = new Map<number, boolean>();

    const recorrer = (nodos: ArbolCompleto[]) => {
      nodos.forEach((nodo) => {
        if (nodo.expanded !== undefined) {
          estado.set(nodo.id, nodo.expanded);
        }
        if (nodo.hijos && nodo.hijos.length > 0) {
          recorrer(nodo.hijos);
        }
      });
    };

    recorrer(nodos);
    return estado;
  };

  // Función para aplicar el estado de expansión al nuevo árbol
  const aplicarEstadoExpansion = (
    nodos: ArbolCompleto[],
    estado: Map<number, boolean>
  ): ArbolCompleto[] => {
    return nodos.map((nodo) => {
      const nuevoNodo = { ...nodo };

      // Aplicar estado de expansión si existe
      if (estado.has(nodo.id)) {
        nuevoNodo.expanded = estado.get(nodo.id);
      }

      // Recursivamente aplicar a hijos
      if (nuevoNodo.hijos && nuevoNodo.hijos.length > 0) {
        nuevoNodo.hijos = aplicarEstadoExpansion(nuevoNodo.hijos, estado);
      }

      return nuevoNodo;
    });
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      // Extraer estado de expansión actual antes de recargar
      const estadoExpansion = extraerEstadoExpansion(arbol);

      const [areasResponse, arbolResponse] = await Promise.all([
        areasJerarquicasService.obtenerLista(),
        areasJerarquicasService.obtenerArbol(),
      ]);

      setTodasLasAreas(areasResponse);

      // Aplicar el estado de expansión preservado al nuevo árbol
      const arbolConEstado = aplicarEstadoExpansion(
        arbolResponse,
        estadoExpansion
      );
      setArbol(arbolConEstado);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setError("Error al cargar los datos. Intente recargar la página.");
    } finally {
      setCargando(false);
    }
  };

  // Manejo de expansión de nodos
  const handleToggleExpansion = (id: number) => {
    const toggleNode = (nodos: ArbolCompleto[]): ArbolCompleto[] => {
      return nodos.map((nodo) => {
        if (nodo.id === id) {
          return { ...nodo, expanded: !nodo.expanded };
        }
        if (nodo.hijos && nodo.hijos.length > 0) {
          return { ...nodo, hijos: toggleNode(nodo.hijos) };
        }
        return nodo;
      });
    };

    setArbol(toggleNode(arbol));
  };

  // Manejo de selección
  const handleSeleccionarArea = (area: ArbolCompleto) => {
    setAreaSeleccionada(area.id === areaSeleccionada ? undefined : area.id);
    setConceptoSeleccionado(undefined);
  };

  const handleSeleccionarConcepto = (concepto: ConceptoJerarquico) => {
    setConceptoSeleccionado(
      concepto.id === conceptoSeleccionado ? undefined : concepto.id
    );
    setAreaSeleccionada(undefined);
  };

  // CRUD de Áreas
  const handleGuardarArea = async (datos: AreaJerarquicaForm) => {
    try {
      setGuardando(true);

      if (modal.tipo === "editar-area") {
        await areasJerarquicasService.actualizar(modal.area.id, datos);
      } else {
        await areasJerarquicasService.crear(datos);
      }

      await cargarDatos();
      setModal({ tipo: "cerrado" });
    } catch (error) {
      console.error("Error al guardar área:", error);
      throw error;
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarArea = async (area: ArbolCompleto) => {
    const confirmar = window.confirm(
      `¿Está seguro de eliminar el área "${area.nombre}"?\n\n` +
        `Esta acción eliminará también:\n` +
        `- ${area.hijos?.length || 0} subareas\n` +
        `- ${area.conceptos?.length || 0} conceptos\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setCargando(true);
      await areasJerarquicasService.eliminar(area.id);
      await cargarDatos();
    } catch (error) {
      console.error("Error al eliminar área:", error);
      setError(
        "Error al eliminar el área. Verifique que no tenga dependencias."
      );
    } finally {
      setCargando(false);
    }
  };

  // CRUD de Conceptos
  const handleGuardarConcepto = async (datos: ConceptoJerarquicoForm) => {
    try {
      setGuardando(true);

      if (modal.tipo === "editar-concepto") {
        await conceptosJerarquicosService.actualizar(modal.concepto.id, datos);
      } else {
        await conceptosJerarquicosService.crear(datos);
      }

      await cargarDatos();
      setModal({ tipo: "cerrado" });
    } catch (error) {
      console.error("Error al guardar concepto:", error);
      throw error;
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarConcepto = async (concepto: ConceptoJerarquico) => {
    const confirmar = window.confirm(
      `¿Está seguro de eliminar el concepto "${concepto.descripcion}"?\n\n` +
        `Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      setCargando(true);
      await conceptosJerarquicosService.eliminar(concepto.id);
      await cargarDatos();
    } catch (error) {
      console.error("Error al eliminar concepto:", error);
      setError("Error al eliminar el concepto.");
    } finally {
      setCargando(false);
    }
  };

  // Buscar área por ID para edición de concepto
  const encontrarAreaPorId = (
    id: number,
    nodos: ArbolCompleto[] = arbol
  ): AreaJerarquica | null => {
    for (const nodo of nodos) {
      if (nodo.id === id) return nodo;
      if (nodo.hijos) {
        const encontrada = encontrarAreaPorId(id, nodo.hijos);
        if (encontrada) return encontrada;
      }
    }
    return null;
  };

  // Funciones de importación
  const handleImportarDemostracion = async () => {
    try {
      setGuardando(true);
      await ImportadorConceptos.importarDatosDemostracion();
      await cargarDatos();
      setModal({ tipo: "cerrado" });
      alert("¡Datos de demostración importados exitosamente!");
    } catch (error) {
      console.error("Error al importar demostración:", error);
      setError("Error al importar los datos de demostración.");
    } finally {
      setGuardando(false);
    }
  };

  const handleImportarTexto = async (texto: string) => {
    try {
      setGuardando(true);
      const estructura = ImportadorConceptos.procesarTextoPegado(texto);
      await ImportadorConceptos.guardarEstructura(estructura);
      await cargarDatos();
      setModal({ tipo: "cerrado" });

      // Calcular estadísticas
      const totalAreas = estructura.reduce((total, area) => {
        const contarAreas = (a: any): number =>
          1 +
          (a.hijos?.reduce(
            (sum: number, hijo: any) => sum + contarAreas(hijo),
            0
          ) || 0);
        return total + contarAreas(area);
      }, 0);

      const totalConceptos = estructura.reduce((total, area) => {
        const contarConceptos = (a: any): number => {
          const propios = a.conceptos?.length || 0;
          const hijos =
            a.hijos?.reduce(
              (sum: number, hijo: any) => sum + contarConceptos(hijo),
              0
            ) || 0;
          return propios + hijos;
        };
        return total + contarConceptos(area);
      }, 0);

      alert(
        `¡Importación completada exitosamente!\n\nSe procesaron:\n- ${totalAreas} áreas\n- ${totalConceptos} conceptos\n\nLas áreas y conceptos existentes no fueron duplicados.`
      );
    } catch (error) {
      console.error("Error al importar conceptos:", error);
      setError(
        "Error al importar los conceptos. Verifique el formato del texto."
      );
    } finally {
      setGuardando(false);
    }
  };

  // Funciones para contar totales recursivamente
  const contarAreasRecursivo = (nodos: ArbolCompleto[]): number => {
    return nodos.reduce((total, nodo) => {
      const areasHijos = nodo.hijos ? contarAreasRecursivo(nodo.hijos) : 0;
      return total + 1 + areasHijos; // 1 para el nodo actual + sus hijos
    }, 0);
  };

  const contarConceptosRecursivo = (nodos: ArbolCompleto[]): number => {
    return nodos.reduce((total, nodo) => {
      const conceptosActuales = nodo.conceptos?.length || 0;
      const conceptosHijos = nodo.hijos
        ? contarConceptosRecursivo(nodo.hijos)
        : 0;
      return total + conceptosActuales + conceptosHijos;
    }, 0);
  };

  // Calcular totales
  const totalAreas = contarAreasRecursivo(arbol);
  const totalConceptos = contarConceptosRecursivo(arbol);

  // Filtrar árbol por búsqueda
  const arbolFiltrado = busqueda.trim()
    ? arbol.filter(
        (nodo) =>
          nodo.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
          nodo.nombre.toLowerCase().includes(busqueda.toLowerCase())
      )
    : arbol;

  if (cargando && arbol.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Cargando sistema jerárquico...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="sistema-jerarquico h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Sistema Jerárquico
          </h1>
          <p className="text-gray-600">
            Gestión de áreas y conceptos sin porcentajes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setModal({ tipo: "nueva-area" })}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={cargando}
          >
            <Plus className="w-4 h-4" />
            Nueva Área
          </button>

          <button
            onClick={() => setModal({ tipo: "importar-conceptos" })}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            disabled={cargando}
          >
            <Upload className="w-4 h-4" />
            Importar
          </button>

          <button
            onClick={handleImportarDemostracion}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            disabled={cargando || guardando}
          >
            <Download className="w-4 h-4" />
            Demo
          </button>

          <button
            onClick={cargarDatos}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={cargando}
          >
            <RefreshCw
              className={`w-5 h-5 ${cargando ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Búsqueda */}
      <div className="p-4 border-b bg-gray-50">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar áreas por código o nombre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Estadísticas */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Folder className="w-4 h-4" />
            <span>{totalAreas} áreas totales</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{totalConceptos} conceptos totales</span>
          </div>
          {busqueda.trim() && (
            <div className="text-blue-600 text-xs">
              Mostrando resultados filtrados
            </div>
          )}
        </div>
      </div>

      {/* Árbol */}
      <div className="flex-1 overflow-auto p-4">
        <ArbolJerarquico
          arbol={arbolFiltrado}
          onToggleExpansion={handleToggleExpansion}
          onSeleccionarArea={handleSeleccionarArea}
          onSeleccionarConcepto={handleSeleccionarConcepto}
          onAgregarSubarea={(padre) => setModal({ tipo: "nueva-area", padre })}
          onAgregarConcepto={(area) =>
            setModal({ tipo: "nuevo-concepto", area })
          }
          onEditarArea={(area) => setModal({ tipo: "editar-area", area })}
          onEditarConcepto={(concepto) => {
            const area = encontrarAreaPorId(concepto.areaId);
            if (area) {
              setModal({ tipo: "editar-concepto", concepto, area });
            }
          }}
          onEliminarArea={handleEliminarArea}
          onEliminarConcepto={handleEliminarConcepto}
          areaSeleccionada={areaSeleccionada}
          conceptoSeleccionado={conceptoSeleccionado}
        />
      </div>

      {/* Modales */}
      {modal.tipo !== "cerrado" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            {modal.tipo === "nueva-area" && (
              <FormularioArea
                areaPadre={modal.padre}
                areasDisponibles={todasLasAreas}
                onGuardar={handleGuardarArea}
                onCancelar={() => setModal({ tipo: "cerrado" })}
                cargando={guardando}
              />
            )}

            {modal.tipo === "editar-area" && (
              <FormularioArea
                area={modal.area}
                areasDisponibles={todasLasAreas}
                onGuardar={handleGuardarArea}
                onCancelar={() => setModal({ tipo: "cerrado" })}
                cargando={guardando}
              />
            )}

            {modal.tipo === "nuevo-concepto" && (
              <FormularioConcepto
                area={modal.area}
                onGuardar={handleGuardarConcepto}
                onCancelar={() => setModal({ tipo: "cerrado" })}
                cargando={guardando}
              />
            )}

            {modal.tipo === "editar-concepto" && (
              <FormularioConcepto
                concepto={modal.concepto}
                area={modal.area}
                onGuardar={handleGuardarConcepto}
                onCancelar={() => setModal({ tipo: "cerrado" })}
                cargando={guardando}
              />
            )}

            {modal.tipo === "importar-conceptos" && (
              <ModalImportarConceptos
                onImportar={handleImportarTexto}
                onCancelar={() => setModal({ tipo: "cerrado" })}
                cargando={guardando}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SistemaJerarquico;
