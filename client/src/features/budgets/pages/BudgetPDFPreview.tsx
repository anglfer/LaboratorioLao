import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { useToast } from "../../dashboard/hooks/use-toast";
import PresupuestoPDF from "../components/PresupuestoPDF";
import { ArrowLeft, Download, Eye, FileText } from "lucide-react";

interface PresupuestoData {
  id: number;
  claveObra?: string;
  cliente?: {
    nombre?: string;
    direccion?: string;
    telefonos?: { telefono: string }[];
    correos?: { correo: string }[];
  };
  nombreContratista?: string;
  contactoResponsable?: string;
  descripcionObra?: string;
  alcance?: string;
  fechaSolicitud?: string;
  estado?: string;
  subtotal?: number;
  iva?: number;
  ivaMonto?: number;
  total?: number;
  manejaAnticipo?: boolean;
  porcentajeAnticipo?: number;
}

interface ConceptoDetalle {
  concepto?: {
    codigo?: string;
    descripcion?: string;
    unidad?: string;
  };
  conceptoCodigo?: string;
  cantidad?: number;
  precioUnitario?: number;
}

const BudgetPDFPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [presupuesto, setPresupuesto] = useState<PresupuestoData | null>(null);
  const [detalles, setDetalles] = useState<ConceptoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [generateingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Obtener presupuesto
        const presRes = await fetch(`/api/presupuestos/${id}`);
        if (!presRes.ok) {
          throw new Error(`Error al obtener presupuesto: ${presRes.status}`);
        }
        const presData = await presRes.json();
        setPresupuesto(presData);

        // Obtener detalles
        const detRes = await fetch(`/api/presupuestos/${id}/detalles`);
        if (!detRes.ok) {
          throw new Error(`Error al obtener detalles: ${detRes.status}`);
        }
        const detData = await detRes.json();
        setDetalles(detData);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error al cargar datos",
          description:
            error.message || "No se pudieron cargar los datos del presupuesto",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleGeneratePDF = async () => {
    if (!id) return;

    try {
      setGeneratingPDF(true);
      console.log(`[PDF Preview] Generando PDF para presupuesto ${id}`);

      // Llamar al endpoint del PDF
      const response = await fetch(`/api/presupuestos/${id}/pdf`);

      if (!response.ok) {
        throw new Error(`Error al generar PDF: ${response.status}`);
      }

      // Obtener el PDF como blob
      const blob = await response.blob();

      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);

      // Crear elemento de descarga temporal
      const a = document.createElement("a");
      a.href = url;
      a.download = `Presupuesto_${presupuesto?.claveObra || id}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(a);
      a.click();

      // Limpiar recursos
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log(`[PDF Preview] PDF generado exitosamente`);
      toast({
        title: "PDF Generado",
        description: "El documento PDF se ha descargado correctamente",
      });
    } catch (error: any) {
      console.error("Error al generar PDF:", error);
      toast({
        title: "Error al generar PDF",
        description: error.message || "No se pudo generar el archivo PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleGoBack = () => {
    navigate("/budgets");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (!presupuesto) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Presupuesto no encontrado
              </h3>
              <p className="text-gray-600 mb-6">
                No se pudo cargar el presupuesto solicitado.
              </p>
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Presupuestos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header con controles */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={handleGoBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Vista Previa del PDF</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Presupuesto: {presupuesto.claveObra || `#${presupuesto.id}`}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={handleGeneratePDF}
                disabled={generateingPDF}
                className="bg-green-600 hover:bg-green-700"
              >
                {generateingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vista previa del PDF */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-gray-100 p-8">
            <div
              className="bg-white shadow-lg mx-auto"
              style={{
                maxWidth: "8.5in",
                minHeight: "11in",
                padding: "1in",
              }}
            >
              <PresupuestoPDF
                presupuesto={presupuesto}
                detalles={detalles}
                forPDF={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Total de conceptos:</strong> {detalles.length}
            </div>
            <div>
              <strong>Subtotal:</strong> $
              {Number(presupuesto.subtotal || 0).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </div>
            <div>
              <strong>Total:</strong> $
              {Number(presupuesto.total || 0).toLocaleString("es-MX", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetPDFPreview;
