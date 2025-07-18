import React, { useState, useEffect } from "react";
import { Folder, Plus, X, Save, AlertCircle } from "lucide-react";
import {
  AreaJerarquica,
  AreaJerarquicaForm,
  getNombreNivelArea,
} from "../types/conceptoJerarquico";

interface FormularioAreaProps {
  area?: AreaJerarquica; // Para edición
  areaPadre?: AreaJerarquica | null; // Para nuevas áreas
  areasDisponibles?: AreaJerarquica[]; // Para seleccionar padre
  onGuardar: (datos: AreaJerarquicaForm) => Promise<void>;
  onCancelar: () => void;
  cargando?: boolean;
  className?: string;
}

export const FormularioArea: React.FC<FormularioAreaProps> = ({
  area,
  areaPadre,
  areasDisponibles = [],
  onGuardar,
  onCancelar,
  cargando = false,
  className = "",
}) => {
  const [datos, setDatos] = useState<AreaJerarquicaForm>({
    codigo: area?.codigo || "",
    nombre: area?.nombre || "",
    padreId: area?.padreId || areaPadre?.id || null,
    nivel: area?.nivel || (areaPadre ? areaPadre.nivel + 1 : 1),
  });

  const [errores, setErrores] = useState<Record<string, string>>({});

  const esEdicion = !!area;

  // Validaciones
  const validarDatos = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!datos.codigo.trim()) {
      nuevosErrores.codigo = "El código es obligatorio";
    } else if (datos.codigo.length < 1) {
      nuevosErrores.codigo = "El código debe tener al menos 1 caracteres";
    }

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    } else if (datos.nombre.length < 3) {
      nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
    }

    if (datos.nivel > 4) {
      nuevosErrores.general =
        "No se pueden crear más de 4 niveles de jerarquía";
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
      console.error("Error al guardar área:", error);
      setErrores({ general: "Error al guardar el área. Intente nuevamente." });
    }
  };

  // Filtrar áreas disponibles para padre (no puede ser hijo de sí mismo)
  const areasParaPadre = areasDisponibles.filter(
    (a) =>
      a.id !== area?.id && // No puede ser padre de sí mismo
      a.nivel < 4 // El padre no puede ser de nivel 4 (porque el hijo sería nivel 5)
  );

  return (
    <div
      className={`formulario-area bg-white rounded-lg shadow-lg border ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">
            {esEdicion ? "Editar Área" : "Nueva Área"}
          </h3>
          {areaPadre && (
            <span className="text-sm text-gray-500">en {areaPadre.nombre}</span>
          )}
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

        {/* Información de nivel */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="text-sm font-medium">
              Nivel: {datos.nivel} - {getNombreNivelArea(datos.nivel)}
            </span>
          </div>
          {areaPadre && (
            <div className="text-xs text-blue-600 mt-1">
              Área padre: {areaPadre.codigo} - {areaPadre.nombre}
            </div>
          )}
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
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errores.codigo ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Ej: CONST, OBRAS, etc."
            disabled={cargando}
            maxLength={20}
          />
          {errores.codigo && (
            <p className="text-sm text-red-600 mt-1">{errores.codigo}</p>
          )}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            value={datos.nombre}
            onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errores.nombre ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Nombre descriptivo del área"
            disabled={cargando}
            maxLength={100}
          />
          {errores.nombre && (
            <p className="text-sm text-red-600 mt-1">{errores.nombre}</p>
          )}
        </div>

        {/* Área padre (solo para edición o si no hay areaPadre fija) */}
        {!areaPadre && areasParaPadre.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Padre (opcional)
            </label>
            <select
              value={datos.padreId || ""}
              onChange={(e) => {
                const nuevoPadreId = e.target.value
                  ? Number(e.target.value)
                  : null;
                const nuevoPadre = nuevoPadreId
                  ? areasDisponibles.find((a) => a.id === nuevoPadreId)
                  : null;
                const nuevoNivel = nuevoPadre ? nuevoPadre.nivel + 1 : 1;

                setDatos({
                  ...datos,
                  padreId: nuevoPadreId,
                  nivel: nuevoNivel,
                });
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={cargando}
            >
              <option value="">-- Área raíz (sin padre) --</option>
              {areasParaPadre.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.codigo} - {area.nombre} (Nivel {area.nivel})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecciona un área padre para crear una jerarquía
            </p>
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
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={cargando}
          >
            {cargando ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {esEdicion ? "Actualizar" : "Crear"} Área
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioArea;
