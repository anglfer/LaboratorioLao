import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  FolderOpen,
  Folder,
  FileText,
  Edit,
  Trash2,
  DollarSign,
  Eye,
  X,
} from "lucide-react";
import {
  ArbolCompleto,
  ConceptoJerarquico,
  AreaJerarquica,
  getNombreNivelArea,
} from "../types/conceptoJerarquico";

interface ArbolJerarquicoProps {
  arbol: ArbolCompleto[];
  onToggleExpansion: (id: number) => void;
  onSeleccionarArea?: (area: ArbolCompleto) => void;
  onSeleccionarConcepto?: (concepto: ConceptoJerarquico) => void;
  onAgregarSubarea?: (padre: ArbolCompleto) => void;
  onAgregarConcepto?: (area: ArbolCompleto) => void;
  onEditarArea?: (area: ArbolCompleto) => void;
  onEditarConcepto?: (concepto: ConceptoJerarquico) => void;
  onEliminarArea?: (area: ArbolCompleto) => void;
  onEliminarConcepto?: (concepto: ConceptoJerarquico) => void;
  areaSeleccionada?: number;
  conceptoSeleccionado?: number;
  className?: string;
  modoSeleccion?: "area" | "concepto" | "ambos";
}

export const ArbolJerarquico: React.FC<ArbolJerarquicoProps> = ({
  arbol,
  onToggleExpansion,
  onSeleccionarArea,
  onSeleccionarConcepto,
  onAgregarSubarea,
  onAgregarConcepto,
  onEditarArea,
  onEditarConcepto,
  onEliminarArea,
  onEliminarConcepto,
  areaSeleccionada,
  conceptoSeleccionado,
  className = "",
  modoSeleccion = "ambos",
}) => {
  const [descripcionModal, setDescripcionModal] =
    useState<ConceptoJerarquico | null>(null);

  const mostrarDescripcionCompleta = (concepto: ConceptoJerarquico) => {
    setDescripcionModal(concepto);
  };

  const cerrarDescripcionModal = () => {
    setDescripcionModal(null);
  };

  return (
    <div className={`arbol-jerarquico ${className}`}>
      {arbol.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Folder className="w-12 h-12 mx-auto mb-2" />
          <p>No hay áreas creadas</p>
        </div>
      ) : (
        arbol.map((nodo) => (
          <NodoArea
            key={nodo.id}
            area={nodo}
            nivel={0}
            onToggleExpansion={onToggleExpansion}
            onSeleccionarArea={onSeleccionarArea}
            onSeleccionarConcepto={onSeleccionarConcepto}
            onAgregarSubarea={onAgregarSubarea}
            onAgregarConcepto={onAgregarConcepto}
            onEditarArea={onEditarArea}
            onEditarConcepto={onEditarConcepto}
            onEliminarArea={onEliminarArea}
            onEliminarConcepto={onEliminarConcepto}
            areaSeleccionada={areaSeleccionada}
            conceptoSeleccionado={conceptoSeleccionado}
            modoSeleccion={modoSeleccion}
            onMostrarDescripcion={mostrarDescripcionCompleta}
          />
        ))
      )}

      {/* Modal de descripción completa */}
      {descripcionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {descripcionModal.codigo}
                </h3>
              </div>
              <button
                onClick={cerrarDescripcionModal}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Descripción Completa:
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {descripcionModal.descripcion}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Unidad:</span>
                  <span className="ml-2 text-gray-800">
                    {descripcionModal.unidad}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Precio:</span>
                  <span className="ml-2 text-gray-800 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {descripcionModal.precioUnitario}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={cerrarDescripcionModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface NodoAreaProps {
  area: ArbolCompleto;
  nivel: number;
  onToggleExpansion: (id: number) => void;
  onSeleccionarArea?: (area: ArbolCompleto) => void;
  onSeleccionarConcepto?: (concepto: ConceptoJerarquico) => void;
  onAgregarSubarea?: (padre: ArbolCompleto) => void;
  onAgregarConcepto?: (area: ArbolCompleto) => void;
  onEditarArea?: (area: ArbolCompleto) => void;
  onEditarConcepto?: (concepto: ConceptoJerarquico) => void;
  onEliminarArea?: (area: ArbolCompleto) => void;
  onEliminarConcepto?: (concepto: ConceptoJerarquico) => void;
  areaSeleccionada?: number;
  conceptoSeleccionado?: number;
  modoSeleccion: "area" | "concepto" | "ambos";
  onMostrarDescripcion?: (concepto: ConceptoJerarquico) => void;
}

const NodoArea: React.FC<NodoAreaProps> = ({
  area,
  nivel,
  onToggleExpansion,
  onSeleccionarArea,
  onSeleccionarConcepto,
  onAgregarSubarea,
  onAgregarConcepto,
  onEditarArea,
  onEditarConcepto,
  onEliminarArea,
  onEliminarConcepto,
  areaSeleccionada,
  conceptoSeleccionado,
  modoSeleccion,
  onMostrarDescripcion,
}) => {
  const indentStyle = { paddingLeft: `${nivel * 20}px` };
  const tieneSubareas = area.hijos && area.hijos.length > 0;
  const tieneConceptos = area.conceptos && area.conceptos.length > 0;
  const esSeleccionada = areaSeleccionada === area.id;
  const puedeExpandir = tieneSubareas || tieneConceptos;

  // Colores por nivel
  const getColorNivel = (nivel: number) => {
    const colores = [
      "border-l-blue-500 bg-blue-50", // Nivel 1
      "border-l-green-500 bg-green-50", // Nivel 2
      "border-l-yellow-500 bg-yellow-50", // Nivel 3
      "border-l-purple-500 bg-purple-50", // Nivel 4+
    ];
    return colores[Math.min(nivel, colores.length - 1)];
  };

  return (
    <div className="area-nodo">
      {/* Área */}
      <div
        className={`
          flex items-center p-2 border-l-4 rounded-r-lg mb-1 cursor-pointer hover:shadow-sm transition-all
          ${getColorNivel(nivel)}
          ${esSeleccionada ? "bg-opacity-80 shadow-md" : "bg-opacity-30"}
        `}
        style={indentStyle}
        onClick={() => onSeleccionarArea?.(area)}
      >
        {/* Icono de expansión */}
        <button
          className="mr-2 p-1 hover:bg-white hover:bg-opacity-50 rounded"
          onClick={(e) => {
            e.stopPropagation();
            if (puedeExpandir) {
              onToggleExpansion(area.id);
            }
          }}
          disabled={!puedeExpandir}
        >
          {!puedeExpandir ? (
            <div className="w-4 h-4" />
          ) : area.expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Icono de carpeta */}
        <div className="mr-2">
          {tieneSubareas || tieneConceptos ? (
            area.expanded ? (
              <FolderOpen className="w-5 h-5 text-blue-600" />
            ) : (
              <Folder className="w-5 h-5 text-blue-600" />
            )
          ) : (
            <Folder className="w-5 h-5 text-gray-400" />
          )}
        </div>

        {/* Información del área */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{area.codigo}</span>
            <span className="text-gray-600">-</span>
            <span className="text-gray-700">{area.nombre}</span>
            <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600">
              {getNombreNivelArea(area.nivel)}
            </span>
          </div>
          {(tieneSubareas || tieneConceptos) && (
            <div className="text-xs text-gray-500 mt-1">
              {tieneSubareas && `${area.hijos?.length} subareas`}
              {tieneSubareas && tieneConceptos && " • "}
              {tieneConceptos && `${area.conceptos?.length} conceptos`}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 ml-2">
          {onAgregarSubarea && (
            <button
              className="p-1 hover:bg-blue-200 rounded text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onAgregarSubarea(area);
              }}
              title="Agregar subárea"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}

          {onAgregarConcepto && (
            <button
              className="p-1 hover:bg-green-200 rounded text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                onAgregarConcepto(area);
              }}
              title="Agregar concepto"
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {onEditarArea && (
            <button
              className="p-1 hover:bg-yellow-200 rounded text-yellow-600"
              onClick={(e) => {
                e.stopPropagation();
                onEditarArea(area);
              }}
              title="Editar área"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {onEliminarArea && (
            <button
              className="p-1 hover:bg-red-200 rounded text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onEliminarArea(area);
              }}
              title="Eliminar área"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido expandido */}
      {area.expanded && (
        <div className="expanded-content">
          {/* Conceptos del área */}
          {area.conceptos?.map((concepto) => (
            <NodoConcepto
              key={concepto.id}
              concepto={concepto}
              nivel={nivel + 1}
              onSeleccionarConcepto={onSeleccionarConcepto}
              onEditarConcepto={onEditarConcepto}
              onEliminarConcepto={onEliminarConcepto}
              conceptoSeleccionado={conceptoSeleccionado}
              modoSeleccion={modoSeleccion}
              onMostrarDescripcion={onMostrarDescripcion}
            />
          ))}

          {/* Subareas */}
          {area.hijos?.map((subarea) => (
            <NodoArea
              key={subarea.id}
              area={subarea}
              nivel={nivel + 1}
              onToggleExpansion={onToggleExpansion}
              onSeleccionarArea={onSeleccionarArea}
              onSeleccionarConcepto={onSeleccionarConcepto}
              onAgregarSubarea={onAgregarSubarea}
              onAgregarConcepto={onAgregarConcepto}
              onEditarArea={onEditarArea}
              onEditarConcepto={onEditarConcepto}
              onEliminarArea={onEliminarArea}
              onEliminarConcepto={onEliminarConcepto}
              areaSeleccionada={areaSeleccionada}
              conceptoSeleccionado={conceptoSeleccionado}
              modoSeleccion={modoSeleccion}
              onMostrarDescripcion={onMostrarDescripcion}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NodoConceptoProps {
  concepto: ConceptoJerarquico;
  nivel: number;
  onSeleccionarConcepto?: (concepto: ConceptoJerarquico) => void;
  onEditarConcepto?: (concepto: ConceptoJerarquico) => void;
  onEliminarConcepto?: (concepto: ConceptoJerarquico) => void;
  conceptoSeleccionado?: number;
  modoSeleccion: "area" | "concepto" | "ambos";
  onMostrarDescripcion?: (concepto: ConceptoJerarquico) => void;
}

const NodoConcepto: React.FC<NodoConceptoProps> = ({
  concepto,
  nivel,
  onSeleccionarConcepto,
  onEditarConcepto,
  onEliminarConcepto,
  conceptoSeleccionado,
  modoSeleccion,
  onMostrarDescripcion,
}) => {
  const indentStyle = { paddingLeft: `${nivel * 20}px` };
  const esSeleccionado = conceptoSeleccionado === concepto.id;

  return (
    <div
      className={`
        flex items-center p-2 ml-4 border-l-2 border-gray-300 rounded-r-lg mb-1 cursor-pointer hover:bg-gray-50 transition-all
        ${esSeleccionado ? "bg-blue-100 border-l-blue-500" : "bg-white"}
      `}
      style={indentStyle}
      onClick={() => onSeleccionarConcepto?.(concepto)}
    >
      {/* Icono de concepto */}
      <div className="mr-2">
        <FileText className="w-4 h-4 text-green-600" />
      </div>

      {/* Información del concepto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className="font-medium text-gray-800 flex-shrink-0">
            {concepto.codigo}
          </span>
          <span className="text-gray-600 flex-shrink-0">-</span>
          <div className="flex-1 min-w-0">
            <span
              className="text-gray-700 break-words block"
              title={concepto.descripcion}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {concepto.descripcion}
            </span>
            {concepto.descripcion && concepto.descripcion.length > 100 && (
              <button
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline mt-1 italic"
                onClick={(e) => {
                  e.stopPropagation();
                  onMostrarDescripcion?.(concepto);
                }}
              >
                ... ver descripción completa
              </button>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
          <span>Unidad: {concepto.unidad}</span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            {concepto.precioUnitario}
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-1 ml-2">
        {onMostrarDescripcion &&
          concepto.descripcion &&
          concepto.descripcion.length > 100 && (
            <button
              className="p-1 hover:bg-blue-200 rounded text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                onMostrarDescripcion(concepto);
              }}
              title="Ver descripción completa"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}

        {onEditarConcepto && (
          <button
            className="p-1 hover:bg-yellow-200 rounded text-yellow-600"
            onClick={(e) => {
              e.stopPropagation();
              onEditarConcepto(concepto);
            }}
            title="Editar concepto"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {onEliminarConcepto && (
          <button
            className="p-1 hover:bg-red-200 rounded text-red-600"
            onClick={(e) => {
              e.stopPropagation();
              onEliminarConcepto(concepto);
            }}
            title="Eliminar concepto"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ArbolJerarquico;
