import React, { useState, useEffect, useRef } from "react";
import { FileText, X, Save, AlertCircle, DollarSign } from "lucide-react";
import {
  ConceptoJerarquico,
  ConceptoJerarquicoForm,
  AreaJerarquica,
} from "../types/conceptoJerarquico";

interface FormularioConceptoProps {
  concepto?: ConceptoJerarquico; // Para edición
  area: AreaJerarquica; // Área donde se creará/editará el concepto
  onGuardar: (datos: ConceptoJerarquicoForm) => Promise<void>;
  onCancelar: () => void;
  cargando?: boolean;
  className?: string;
}

const UNIDADES_COMUNES = [
  "pza",
  "m",
  "m²",
  "m³",
  "kg",
  "ton",
  "L",
  "mL",
  "lote",
  "global",
  "h",
  "día",
  "mes",
  "servicio",
  "visita",
  "prueba",
  "muestra",
  "ensaye",
  "pozo",
  "cárcamo",
  "estación",
  "viaje",
  "cálculo",
  "diseño",
  "análisis",
  "informe",
  "estudio",
  "juego",
  "permiso",
  "espécimen",
  "jornal",
  "spot",
  "probeta",
  "semana",
  "topografía",
  "hoja",
];

export const FormularioConcepto: React.FC<FormularioConceptoProps> = ({
  concepto,
  area,
  onGuardar,
  onCancelar,
  cargando = false,
  className = "",
}) => {
  const [datos, setDatos] = useState<ConceptoJerarquicoForm>({
    codigo: concepto?.codigo || "",
    descripcion: concepto?.descripcion || "",
    unidad: concepto?.unidad || "",
    precioUnitario: concepto?.precioUnitario || "",
    areaId: area.id,
  });

  const [errores, setErrores] = useState<Record<string, string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const esEdicion = !!concepto;

  // Función para auto-resize del textarea
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 100), 300);
    textarea.style.height = newHeight + "px";
  };

  // Effect para auto-resize inicial cuando hay contenido
  useEffect(() => {
    if (textareaRef.current && datos.descripcion) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [datos.descripcion]);

  // Validaciones
  const validarDatos = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!datos.codigo.trim()) {
      nuevosErrores.codigo = "El código es obligatorio";
    } else if (datos.codigo.length < 2) {
      nuevosErrores.codigo = "El código debe tener al menos 2 caracteres";
    }

    if (!datos.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    } else if (datos.descripcion.length < 5) {
      nuevosErrores.descripcion =
        "La descripción debe tener al menos 5 caracteres";
    } else if (datos.descripcion.length > 2000) {
      nuevosErrores.descripcion =
        "La descripción no puede exceder 2000 caracteres";
    }

    if (!datos.unidad.trim()) {
      nuevosErrores.unidad = "La unidad es obligatoria";
    }

    if (!datos.precioUnitario.trim()) {
      nuevosErrores.precioUnitario = "El precio unitario es obligatorio";
    } else {
      const precio = parseFloat(datos.precioUnitario);
      if (isNaN(precio) || precio <= 0) {
        nuevosErrores.precioUnitario = "El precio debe ser un número mayor a 0";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarDatos()) return;

    try {
      await onGuardar(datos);
    } catch (error) {
      console.error("Error al guardar concepto:", error);
      setErrores({
        general: "Error al guardar el concepto. Intente nuevamente.",
      });
    }
  };

  const formatearPrecio = (valor: string) => {
    // Remover caracteres no numéricos excepto punto y coma
    const soloNumeros = valor.replace(/[^0-9.,]/g, "");
    // Convertir comas a puntos
    const conPuntos = soloNumeros.replace(",", ".");
    return conPuntos;
  };

  const handlePrecioChange = (valor: string) => {
    const precioFormateado = formatearPrecio(valor);
    setDatos({ ...datos, precioUnitario: precioFormateado });
  };

  return (
    <div
      className={`formulario-concepto bg-white rounded-lg shadow-lg border ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {esEdicion ? "Editar Concepto" : "Nuevo Concepto"}
          </h3>
          <span className="text-sm text-gray-500">
            en {area.codigo} - {area.nombre}
          </span>
        </div>
        <button
          onClick={onCancelar}
          className="p-1 hover:bg-gray-100 rounded"
          disabled={cargando}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Error general */}
        {errores.general && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{errores.general}</span>
          </div>
        )}

        {/* Información del área */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <span className="text-sm font-medium">
              Área: {area.codigo} - {area.nombre}
            </span>
          </div>
          <div className="text-xs text-green-600 mt-1">
            Nivel {area.nivel} - Los conceptos se asignan a áreas específicas
          </div>
        </div>

        {/* Código */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código *
          </label>
          <input
            type="text"
            value={datos.codigo}
            onChange={(e) =>
              setDatos({ ...datos, codigo: e.target.value.toUpperCase() })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
              errores.codigo ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Ej: C001, CONC-001, etc."
            disabled={cargando}
            maxLength={30}
          />
          {errores.codigo && (
            <p className="text-sm text-red-600 mt-1">{errores.codigo}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            ref={textareaRef}
            value={datos.descripcion}
            onChange={(e) => {
              setDatos({ ...datos, descripcion: e.target.value });
              autoResizeTextarea(e.target);
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
              errores.descripcion ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Descripción detallada del concepto (puede ser tan larga como necesites)"
            disabled={cargando}
            style={{
              minHeight: "100px",
              maxHeight: "300px",
              overflow: "auto",
              resize: "vertical",
            }}
          />
          {errores.descripcion && (
            <p className="text-sm text-red-600 mt-1">{errores.descripcion}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {datos.descripcion.length} caracteres
          </p>
        </div>

        {/* Unidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unidad * (según NOM-008 mexicana)
          </label>
          <div className="relative">
            <input
              type="text"
              value={datos.unidad}
              onChange={(e) =>
                setDatos({ ...datos, unidad: e.target.value.toLowerCase() })
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errores.unidad ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Unidad de medida (ej: m, kg, pza, visita)"
              disabled={cargando}
              maxLength={15}
              list="unidades-comunes"
            />
            <datalist id="unidades-comunes">
              {UNIDADES_COMUNES.map((unidad) => (
                <option key={unidad} value={unidad} />
              ))}
            </datalist>
          </div>
          {errores.unidad && (
            <p className="text-sm text-red-600 mt-1">{errores.unidad}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Unidades en minúscula según NOM-008 (excepto L para litro)
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {UNIDADES_COMUNES.slice(0, 10).map((unidad) => (
              <button
                key={unidad}
                type="button"
                onClick={() => setDatos({ ...datos, unidad })}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border"
                disabled={cargando}
              >
                {unidad}
              </button>
            ))}
          </div>
        </div>

        {/* Precio Unitario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Precio Unitario *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={datos.precioUnitario}
              onChange={(e) => handlePrecioChange(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errores.precioUnitario ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="0.00"
              disabled={cargando}
            />
          </div>
          {errores.precioUnitario && (
            <p className="text-sm text-red-600 mt-1">
              {errores.precioUnitario}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Precio en pesos mexicanos (use punto para decimales)
          </p>
        </div>

        {/* Vista previa */}
        {datos.codigo &&
          datos.descripcion &&
          datos.unidad &&
          datos.precioUnitario && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Vista previa:
              </h4>
              <div className="text-sm text-gray-600">
                <div className="mb-2">
                  <strong>Código:</strong> {datos.codigo}
                </div>
                <div className="mb-2">
                  <strong>Descripción:</strong>
                  <div className="mt-1 p-2 bg-white border rounded text-sm max-h-32 overflow-y-auto">
                    {datos.descripcion}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <span>
                    <strong>Unidad:</strong> {datos.unidad}
                  </span>
                  <span className="flex items-center gap-1">
                    <strong>Precio:</strong>
                    <DollarSign className="w-3 h-3" />
                    {datos.precioUnitario}
                  </span>
                </div>
              </div>
            </div>
          )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={cargando}
          >
            {cargando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {esEdicion ? "Actualizar" : "Crear"} Concepto
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioConcepto;
