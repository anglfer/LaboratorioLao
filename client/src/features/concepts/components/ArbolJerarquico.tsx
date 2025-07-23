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
    <div className={`${className}`} style={{ backgroundColor: "#FFFFFF" }}>
      {arbol.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border border-dashed"
          style={{
            borderColor: "#E7F2E0",
            backgroundColor: "#FAFBFC",
          }}
        >
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#E7F2E0" }}
          >
            <Folder className="w-8 h-8" style={{ color: "#68A53B" }} />
          </div>
          <p className="text-base font-medium" style={{ color: "#2C3E50" }}>
            No hay áreas registradas
          </p>
          <p className="text-sm mt-1" style={{ color: "#6C757D" }}>
            Comience creando su primera área de trabajo
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {arbol.map((nodo) => (
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
          ))}
        </div>
      )}

      {/* Modal profesional de descripción */}
      {descripcionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div
            className="rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            {/* Header del modal */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "#E7F2E0" }}
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#E7F2E0" }}
                >
                  <FileText className="w-5 h-5" style={{ color: "#68A53B" }} />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: "#2C3E50" }}
                  >
                    {descripcionModal.codigo}
                  </h3>
                  <p className="text-sm" style={{ color: "#6C757D" }}>
                    Descripción detallada del concepto
                  </p>
                </div>
              </div>
              <button
                onClick={cerrarDescripcionModal}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{
                  backgroundColor: "#F8F9FA",
                  color: "#6C757D",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#E9ECEF";
                  e.currentTarget.style.color = "#495057";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#F8F9FA";
                  e.currentTarget.style.color = "#6C757D";
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6 max-h-[60vh] overflow-auto">
              <div className="mb-6">
                <h4
                  className="text-sm font-medium mb-3"
                  style={{ color: "#2C3E50" }}
                >
                  Descripción Completa
                </h4>
                <div
                  className="p-4 rounded-lg border text-sm leading-relaxed"
                  style={{
                    backgroundColor: "#F8F9FA",
                    borderColor: "#E7F2E0",
                    color: "#2C3E50",
                  }}
                >
                  <p className="whitespace-pre-wrap">
                    {descripcionModal.descripcion}
                  </p>
                </div>
              </div>

              {/* Información adicional en grid */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E7F2E0",
                  }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: "#68A53B" }}
                    />
                    <span
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: "#6C757D" }}
                    >
                      Unidad
                    </span>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#2C3E50" }}
                  >
                    {descripcionModal.unidad}
                  </span>
                </div>

                <div
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderColor: "#E7F2E0",
                  }}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign
                      className="w-3 h-3"
                      style={{ color: "#68A53B" }}
                    />
                    <span
                      className="text-xs font-medium uppercase tracking-wide"
                      style={{ color: "#6C757D" }}
                    >
                      Precio Unitario
                    </span>
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "#2C3E50" }}
                  >
                    ${descripcionModal.precioUnitario.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer del modal */}
            <div
              className="px-6 py-4 border-t flex justify-end"
              style={{
                borderColor: "#E7F2E0",
                backgroundColor: "#FAFBFC",
              }}
            >
              <button
                onClick={cerrarDescripcionModal}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: "#68A53B",
                  color: "#FFFFFF",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5A8F33";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#68A53B";
                }}
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
  const indentStyle = { paddingLeft: `${nivel * 24}px` };
  const tieneSubareas = area.hijos && area.hijos.length > 0;
  const tieneConceptos = area.conceptos && area.conceptos.length > 0;
  const esSeleccionada = areaSeleccionada === area.id;
  const puedeExpandir = tieneSubareas || tieneConceptos;

  // Contadores seguros
  const cantidadSubareas = area.hijos?.length || 0;
  const cantidadConceptos = area.conceptos?.length || 0;

  // Colores corporativos por nivel
  const getEstiloNivel = (nivel: number) => {
    const estilos = [
      { borderColor: "#68A53B", backgroundColor: "#E7F2E0" }, // Nivel 1 - Verde corporativo
      { borderColor: "#2C3E50", backgroundColor: "#EDF2F7" }, // Nivel 2 - Azul gris
      { borderColor: "#F39C12", backgroundColor: "#FFF8E7" }, // Nivel 3 - Naranja
      { borderColor: "#9B59B6", backgroundColor: "#F4F0FF" }, // Nivel 4+ - Púrpura
    ];
    return estilos[Math.min(nivel, estilos.length - 1)];
  };

  const estiloNivel = getEstiloNivel(nivel);

  return (
    <div className="mb-2">
      {/* Nodo del área - diseño minimalista */}
      <div
        className="group flex items-center p-3 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md"
        style={{
          borderLeftColor: estiloNivel.borderColor,
          backgroundColor: esSeleccionada
            ? estiloNivel.backgroundColor
            : "#FFFFFF",
          borderTopColor: "#F8F9FA",
          borderRightColor: "#F8F9FA",
          borderBottomColor: "#F8F9FA",
          borderWidth: "1px",
          borderLeftWidth: "4px",
          ...indentStyle,
        }}
        onClick={() => onSeleccionarArea?.(area)}
        onMouseEnter={(e) => {
          if (!esSeleccionada) {
            e.currentTarget.style.backgroundColor = "#FAFBFC";
          }
        }}
        onMouseLeave={(e) => {
          if (!esSeleccionada) {
            e.currentTarget.style.backgroundColor = "#FFFFFF";
          }
        }}
      >
        {/* Botón de expansión minimalista */}
        <button
          className="mr-3 w-6 h-6 rounded-md flex items-center justify-center transition-colors"
          style={{
            backgroundColor: puedeExpandir ? "#F8F9FA" : "transparent",
            color: puedeExpandir ? "#6C757D" : "transparent",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (puedeExpandir) {
              onToggleExpansion(area.id);
            }
          }}
          disabled={!puedeExpandir}
          onMouseEnter={(e) => {
            if (puedeExpandir) {
              e.currentTarget.style.backgroundColor = "#E9ECEF";
            }
          }}
          onMouseLeave={(e) => {
            if (puedeExpandir) {
              e.currentTarget.style.backgroundColor = "#F8F9FA";
            }
          }}
        >
          {puedeExpandir &&
            (area.expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            ))}
        </button>

        {/* Icono de carpeta corporativo */}
        <div
          className="mr-3 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: estiloNivel.backgroundColor }}
        >
          {area.expanded && (tieneSubareas || tieneConceptos) ? (
            <FolderOpen
              className="w-5 h-5"
              style={{ color: estiloNivel.borderColor }}
            />
          ) : (
            <Folder
              className="w-5 h-5"
              style={{ color: estiloNivel.borderColor }}
            />
          )}
        </div>

        {/* Información del área */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span
              className="font-semibold text-sm"
              style={{ color: "#2C3E50" }}
            >
              {area.codigo}
            </span>
            <span className="text-xs" style={{ color: "#6C757D" }}>
              •
            </span>
            <span
              className="font-medium text-sm truncate"
              style={{ color: "#2C3E50" }}
              title={area.nombre}
            >
              {area.nombre}
            </span>
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{
                color: "#6C757D",
                backgroundColor: "#F8F9FA",
              }}
            >
              {getNombreNivelArea(area.nivel)}
            </span>
          </div>

          {/* Resumen de contenido */}
          {(tieneSubareas || tieneConceptos) && (
            <div className="flex items-center space-x-3 text-xs">
              {tieneSubareas && (
                <span style={{ color: "#6C757D" }}>
                  {cantidadSubareas} subárea{cantidadSubareas !== 1 ? "s" : ""}
                </span>
              )}
              {tieneConceptos && (
                <span style={{ color: "#6C757D" }}>
                  {cantidadConceptos} concepto
                  {cantidadConceptos !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Acciones - aparecen en hover */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onAgregarSubarea && (
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "#E7F2E0",
                color: "#68A53B",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAgregarSubarea(area);
              }}
              title="Agregar subárea"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4F2C5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E7F2E0";
              }}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
          {onAgregarConcepto && (
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "#E7F2E0",
                color: "#68A53B",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onAgregarConcepto(area);
              }}
              title="Agregar concepto"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#D4F2C5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E7F2E0";
              }}
            >
              <FileText className="w-4 h-4" />
            </button>
          )}

          {onEditarArea && (
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "#FFF8E7",
                color: "#F39C12",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEditarArea(area);
              }}
              title="Editar área"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FEF3D2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFF8E7";
              }}
            >
              <Edit className="w-4 h-4" />
            </button>
          )}

          {onEliminarArea && (
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{
                backgroundColor: "#FEF2F2",
                color: "#C0392B",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onEliminarArea(area);
              }}
              title="Eliminar área"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FDE8E8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FEF2F2";
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenido expandido - diseño mejorado */}
      {area.expanded && (
        <div
          className="mt-2 ml-6 space-y-1"
          style={{
            borderLeft: "2px solid #F8F9FA",
            paddingLeft: "16px",
          }}
        >
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
  const esSeleccionado = conceptoSeleccionado === concepto.id;

  return (
    <div
      className="group flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm"
      style={{
        backgroundColor: esSeleccionado ? "#E7F2E0" : "#FFFFFF",
        borderColor: esSeleccionado ? "#68A53B" : "#F8F9FA",
      }}
      onClick={() => onSeleccionarConcepto?.(concepto)}
      onMouseEnter={(e) => {
        if (!esSeleccionado) {
          e.currentTarget.style.backgroundColor = "#FAFBFC";
        }
      }}
      onMouseLeave={(e) => {
        if (!esSeleccionado) {
          e.currentTarget.style.backgroundColor = "#FFFFFF";
        }
      }}
    >
      {/* Icono del concepto */}
      <div
        className="mr-3 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: "#E7F2E0" }}
      >
        <FileText className="w-4 h-4" style={{ color: "#68A53B" }} />
      </div>

      {/* Información principal */}
      <div className="flex-1 min-w-0">
        {/* Header con código y precio */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2 min-w-0">
            <span
              className="font-semibold text-sm flex-shrink-0"
              style={{ color: "#2C3E50" }}
            >
              {concepto.codigo}
            </span>
            <span
              className="text-xs flex-shrink-0"
              style={{ color: "#6C757D" }}
            >
              •
            </span>
            <span
              className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
              style={{
                backgroundColor: "#F8F9FA",
                color: "#6C757D",
              }}
            >
              {concepto.unidad}
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs font-medium">
            <DollarSign className="w-3 h-3" style={{ color: "#68A53B" }} />
            <span style={{ color: "#2C3E50" }}>
              {concepto.precioUnitario.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Descripción truncada */}
        <div className="mb-2">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "#2C3E50" }}
            title={concepto.descripcion}
          >
            {concepto.descripcion.length > 120
              ? `${concepto.descripcion.substring(0, 120)}...`
              : concepto.descripcion}
          </p>

          {concepto.descripcion.length > 120 && (
            <button
              className="text-xs font-medium mt-1 transition-colors"
              style={{ color: "#68A53B" }}
              onClick={(e) => {
                e.stopPropagation();
                onMostrarDescripcion?.(concepto);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#5A8F33";
                e.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#68A53B";
                e.currentTarget.style.textDecoration = "none";
              }}
            >
              Ver descripción completa →
            </button>
          )}
        </div>
      </div>

      {/* Acciones - aparecen en hover */}
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        {onMostrarDescripcion && concepto.descripcion.length > 120 && (
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#EDF2F7",
              color: "#2C3E50",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onMostrarDescripcion(concepto);
            }}
            title="Ver descripción completa"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#E2E8F0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#EDF2F7";
            }}
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {onEditarConcepto && (
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#FFF8E7",
              color: "#F39C12",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEditarConcepto(concepto);
            }}
            title="Editar concepto"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF3D2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FFF8E7";
            }}
          >
            <Edit className="w-4 h-4" />
          </button>
        )}

        {onEliminarConcepto && (
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{
              backgroundColor: "#FEF2F2",
              color: "#C0392B",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onEliminarConcepto(concepto);
            }}
            title="Eliminar concepto"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FDE8E8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FEF2F2";
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ArbolJerarquico;
