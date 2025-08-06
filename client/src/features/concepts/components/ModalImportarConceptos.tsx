import React, { useState } from "react";
import { X, Upload, FileText, AlertCircle } from "lucide-react";

interface ModalImportarConceptosProps {
  onImportar: (texto: string) => Promise<void>;
  onCancelar: () => void;
  cargando: boolean;
}

export const ModalImportarConceptos: React.FC<ModalImportarConceptosProps> = ({
  onImportar,
  onCancelar,
  cargando,
}) => {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!texto.trim()) {
      setError("Por favor, ingrese el texto a importar");
      return;
    }

    try {
      setError(null);
      await onImportar(texto);
    } catch (error) {
      setError("Error al procesar el texto. Verifique el formato.");
    }
  };

  const ejemploTexto = `2	CONTROL DE CALIDAD
2.1	TERRACERÍAS
2.1.1	TRABAJOS DE CAMPO
2.1.1.1 (+)	"VISITA PARA DETERMINACIÓN DE MASA VOLUMÉTRICA SECA DEL LUGAR (CALAS) Y GRADO DE COMPACTACIÓN. INCLUYE: determinación del contenido de agua en laboratorio, análisis y reporte, con un máximo de 5 ensayes (calas) y traslados."	VISITA	$1,231.53

Variedad de tipos de conceptos:
2.2.2.1	"DETERMINACIÓN DE LA RESISTENCIA MECÁNICA..."	PRUEBA	$104.01
2.2.2.3	"ENSAYE A TENSIÓN POR FLEXIÓN DE ESPECÍMENES PRISMÁTICOS (VIGAS)..."	PIEZA	$173.84
2.2.2.5	"DISEÑO DE PROPORCIONAMIENTO MEZCLAS DE CONCRETO HIDRÁULICO..."	DISEÑO	$6,933.33
2.2.2.6	DETERMINACIÓN DE RESISTENCIA A LA COMPRESIÓN SIMPLE EN CUBOS...	SERIE	$317.04
2.2.2.7 (+)	PROBETAS DE CONCRETO HIDRÁULICO EN LOSAS DE CIMENTACION...	ENSAYO	$317.04

El sistema detecta automáticamente los tipos: VISITA, PRUEBA, PIEZA, DISEÑO, SERIE, ENSAYO, etc.`;

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Importar Conceptos
          </h2>
        </div>
        <button
          onClick={onCancelar}
          className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
          disabled={cargando}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto a Importar
          </label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Pegue aquí el texto con la estructura jerárquica..."
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
            disabled={cargando}
          />
          <p className="text-sm text-gray-600 mt-2">
            Pegue el texto copiado desde Excel o Word. El sistema detectará
            automáticamente las áreas y conceptos, respetando los existentes y
            agregando solo los nuevos. <strong>Sistema Mejorado:</strong> Ahora
            maneja mejor conceptos con descripciones en múltiples líneas,
            incluyendo listas que empiecen con "Se incluye:", "INCLUYE:", o
            elementos con guiones.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Manejo de Múltiples Líneas:</strong> El sistema puede
              manejar conceptos que se extienden en varias líneas (como listas
              con "Se incluye:", "INCLUYE:", etc.). Sin embargo, para mejor
              compatibilidad, se recomienda mantener toda la información en una
              sola línea cuando sea posible.
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
            <h4 className="text-sm font-medium text-blue-800">
              Formato Esperado
            </h4>
          </div>
          <pre className="text-xs text-blue-700 font-mono whitespace-pre-wrap">
            {ejemploTexto}
          </pre>
          <p className="text-sm text-blue-600 mt-2">
            • <strong>Sistema Inteligente:</strong> Detecta áreas existentes y
            solo agrega nuevos elementos
            <br />• <strong>Sin duplicados:</strong> Los códigos ya existentes
            se conservan intactos
            <br />• <strong>Nombres inteligentes:</strong> Si encuentra un área
            explícita (ej: "2.1.1 TRABAJOS DE CAMPO"), usará ese nombre. Si
            falta, creará "SUBCATEGORÍA 2.1.1"
            <br />• <strong>Múltiples líneas mejorado:</strong> El sistema ahora
            reconoce automáticamente cuando líneas como "Se incluye:", listas
            con guiones, o información técnica pertenecen al concepto anterior
            <br />• <strong>Separar columnas con tabulaciones</strong>
            <br />
            • Áreas: solo código y nombre
            <br />• Conceptos: incluir (+), tipo, % y precio con $
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={cargando || !texto.trim()}
          >
            {cargando ? "Importando..." : "Importar Conceptos"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModalImportarConceptos;
