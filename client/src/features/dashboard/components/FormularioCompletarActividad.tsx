import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Save } from "lucide-react";

interface FormularioActividadProps {
  actividadId: number;
  obra: string;
  concepto: string;
  onGuardar: (datos: any) => void;
  onCancelar: () => void;
}

export function FormularioCompletarActividad({
  actividadId,
  obra,
  concepto,
  onGuardar,
  onCancelar,
}: FormularioActividadProps) {
  const [formData, setFormData] = useState({
    muestrasObtenidas: "",
    estadoObra: "",
    condicionesClimaticas: "",
    temperaturaAmbiente: "",
    humedadRelativa: "",
    observaciones: "",
    problemasEncontrados: "",
    tiempoInicio: "",
    tiempoFin: "",
    residentePresente: false,
    documentacionCompleta: false,
    equipoEnBuenEstado: false,
    seguridadCumplida: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      actividadId,
      ...formData,
      fechaCompletado: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Completar Actividad</CardTitle>
            <div className="text-sm text-gray-600">
              <p>
                <strong>Obra:</strong> {obra}
              </p>
              <p>
                <strong>Concepto:</strong> {concepto}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de muestras */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="muestrasObtenidas">Muestras Obtenidas</Label>
                  <Input
                    id="muestrasObtenidas"
                    type="number"
                    value={formData.muestrasObtenidas}
                    onChange={(e) =>
                      handleInputChange("muestrasObtenidas", e.target.value)
                    }
                    placeholder="Número de muestras"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="estadoObra">Estado de la Obra</Label>
                  <select
                    id="estadoObra"
                    value={formData.estadoObra}
                    onChange={(e) =>
                      handleInputChange("estadoObra", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="activa">Activa</option>
                    <option value="pausada">Pausada</option>
                    <option value="inactiva">Inactiva</option>
                  </select>
                </div>
              </div>

              {/* Condiciones ambientales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="condicionesClimaticas">
                    Condiciones Climáticas
                  </Label>
                  <select
                    id="condicionesClimaticas"
                    value={formData.condicionesClimaticas}
                    onChange={(e) =>
                      handleInputChange("condicionesClimaticas", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="">Seleccionar clima</option>
                    <option value="soleado">Soleado</option>
                    <option value="nublado">Nublado</option>
                    <option value="lluvioso">Lluvioso</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="temperaturaAmbiente">
                    Temperatura Ambiente (°C)
                  </Label>
                  <Input
                    id="temperaturaAmbiente"
                    type="number"
                    value={formData.temperaturaAmbiente}
                    onChange={(e) =>
                      handleInputChange("temperaturaAmbiente", e.target.value)
                    }
                    placeholder="25"
                  />
                </div>

                <div>
                  <Label htmlFor="humedadRelativa">Humedad Relativa (%)</Label>
                  <Input
                    id="humedadRelativa"
                    type="number"
                    value={formData.humedadRelativa}
                    onChange={(e) =>
                      handleInputChange("humedadRelativa", e.target.value)
                    }
                    placeholder="60"
                  />
                </div>
              </div>

              {/* Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tiempoInicio">Hora de Inicio</Label>
                  <Input
                    id="tiempoInicio"
                    type="time"
                    value={formData.tiempoInicio}
                    onChange={(e) =>
                      handleInputChange("tiempoInicio", e.target.value)
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tiempoFin">Hora de Finalización</Label>
                  <Input
                    id="tiempoFin"
                    type="time"
                    value={formData.tiempoFin}
                    onChange={(e) =>
                      handleInputChange("tiempoFin", e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* Verificaciones con checkboxes simples */}
              <div>
                <Label className="text-base font-medium">Verificaciones</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="residentePresente"
                      checked={formData.residentePresente}
                      onChange={(e) =>
                        handleInputChange("residentePresente", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="residentePresente">
                      Residente de obra presente durante el muestreo
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="documentacionCompleta"
                      checked={formData.documentacionCompleta}
                      onChange={(e) =>
                        handleInputChange(
                          "documentacionCompleta",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="documentacionCompleta">
                      Documentación completa y firmada
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="equipoEnBuenEstado"
                      checked={formData.equipoEnBuenEstado}
                      onChange={(e) =>
                        handleInputChange(
                          "equipoEnBuenEstado",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="equipoEnBuenEstado">
                      Equipo en buen estado
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="seguridadCumplida"
                      checked={formData.seguridadCumplida}
                      onChange={(e) =>
                        handleInputChange("seguridadCumplida", e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="seguridadCumplida">
                      Protocolos de seguridad cumplidos
                    </Label>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <Label htmlFor="observaciones">Observaciones Generales</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) =>
                    handleInputChange("observaciones", e.target.value)
                  }
                  placeholder="Describe cualquier observación importante..."
                  rows={3}
                />
              </div>

              {/* Problemas encontrados */}
              <div>
                <Label htmlFor="problemasEncontrados">
                  Problemas Encontrados
                </Label>
                <Textarea
                  id="problemasEncontrados"
                  value={formData.problemasEncontrados}
                  onChange={(e) =>
                    handleInputChange("problemasEncontrados", e.target.value)
                  }
                  placeholder="Describe cualquier problema o dificultad encontrada..."
                  rows={3}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Guardar y Completar
                </Button>
                <Button type="button" variant="outline" onClick={onCancelar}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
