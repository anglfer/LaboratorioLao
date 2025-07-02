import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import {
  Calendar,
  MapPin,
  Truck,
  Wrench,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Flag,
} from "lucide-react";

interface ActividadBrigadista {
  id: number;
  obra: string;
  direccion: string;
  horaProgramada: string;
  tipoProgramacion: string;
  concepto: string;
  cantidadMuestras: number;
  vehiculo: string;
  herramientas: string[];
  estado: "programada" | "en_proceso" | "completada";
  residente?: string;
  telefono?: string;
}

export function BrigadistaDashboard() {
  const [actividades] = useState<ActividadBrigadista[]>([
    {
      id: 1,
      obra: "Obra ABC-001",
      direccion: "Av. Principal 123, Col. Centro",
      horaProgramada: "09:00",
      tipoProgramacion: "Muestreo de concreto",
      concepto: "Toma de muestras cilíndricas",
      cantidadMuestras: 6,
      vehiculo: "VEH-001 - Nissan NP300",
      herramientas: ["Moldes cilíndricos", "Cono de Abrams", "Termómetro"],
      estado: "programada",
      residente: "Ing. José García",
      telefono: "555-1234",
    },
    {
      id: 2,
      obra: "Obra DEF-002",
      direccion: "Calle Secundaria 456, Col. Norte",
      horaProgramada: "14:00",
      tipoProgramacion: "Prueba de compactación",
      concepto: "Ensayo Proctor modificado",
      cantidadMuestras: 3,
      vehiculo: "VEH-001 - Nissan NP300",
      herramientas: ["Martillo Proctor", "Molde de compactación", "Balanza"],
      estado: "programada",
      residente: "Ing. María López",
      telefono: "555-5678",
    },
  ]);

  const iniciarActividad = (id: number) => {
    console.log(`Iniciando actividad ${id}`);
    // Aquí iría la lógica para marcar como iniciada
  };

  const completarActividad = (id: number) => {
    console.log(`Completando actividad ${id}`);
    // Aquí iría la lógica para completar actividad
  };

  const estadoActual = {
    programadas: actividades.filter((a) => a.estado === "programada").length,
    enProceso: actividades.filter((a) => a.estado === "en_proceso").length,
    completadas: actividades.filter((a) => a.estado === "completada").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mi Jornada de Trabajo
          </h1>
          <p className="text-gray-600 mt-2">Actividades programadas para hoy</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Resumen del Estado */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Programadas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estadoActual.programadas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En Proceso</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estadoActual.enProceso}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estadoActual.completadas}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Actividades */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Actividades del Día
        </h2>

        {actividades.map((actividad) => (
          <Card
            key={actividad.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{actividad.obra}</CardTitle>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      actividad.estado === "programada"
                        ? "bg-blue-100 text-blue-800"
                        : actividad.estado === "en_proceso"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {actividad.estado === "programada"
                      ? "Programada"
                      : actividad.estado === "en_proceso"
                      ? "En Proceso"
                      : "Completada"}
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {actividad.horaProgramada}
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-sm">Ubicación</p>
                      <p className="text-sm text-gray-600">
                        {actividad.direccion}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    <Truck className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-sm">Vehículo Asignado</p>
                      <p className="text-sm text-gray-600">
                        {actividad.vehiculo}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-start gap-2 mb-2">
                    <Flag className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="font-medium text-sm">Tipo de Trabajo</p>
                      <p className="text-sm text-gray-600">
                        {actividad.tipoProgramacion}
                      </p>
                      <p className="text-xs text-gray-500">
                        {actividad.cantidadMuestras} muestras
                      </p>
                    </div>
                  </div>

                  {actividad.residente && (
                    <div className="mb-2">
                      <p className="font-medium text-sm">Residente de Obra</p>
                      <p className="text-sm text-gray-600">
                        {actividad.residente}
                      </p>
                      <p className="text-xs text-gray-500">
                        {actividad.telefono}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Herramientas */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="h-4 w-4 text-gray-500" />
                  <p className="font-medium text-sm">Herramientas Necesarias</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {actividad.herramientas.map((herramienta, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                    >
                      {herramienta}
                    </span>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                {actividad.estado === "programada" && (
                  <Button
                    onClick={() => iniciarActividad(actividad.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Actividad
                  </Button>
                )}

                {actividad.estado === "en_proceso" && (
                  <>
                    <Button
                      onClick={() => completarActividad(actividad.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Completar
                    </Button>
                    <Button variant="outline">
                      <Pause className="mr-2 h-4 w-4" />
                      Pausar
                    </Button>
                  </>
                )}

                {actividad.estado === "completada" && (
                  <Button variant="outline" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completada
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {actividades.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay actividades programadas
            </h3>
            <p className="text-gray-600">
              No tienes actividades programadas para el día de hoy.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
