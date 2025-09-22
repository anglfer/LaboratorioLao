import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
} from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";
import { Button } from "../../../shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../shared/components/ui/dropdown-menu";
import {
  MapPin,
  User,
  Truck,
  Clock,
  MoreVertical,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { ESTADOS_PROGRAMACION } from "../types/programming";
import type { Programacion, EstadoProgramacion } from "../types/programming";

interface ProgrammingCardProps {
  programacion: Programacion;
  onStatusChange?: (id: number, estado: EstadoProgramacion) => void;
  onView?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

export default function ProgrammingCard({
  programacion,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
  compact = false,
}: ProgrammingCardProps) {
  const estadoConfig = ESTADOS_PROGRAMACION[programacion.estado];

  const handleStatusChange = (nuevoEstado: EstadoProgramacion) => {
    onStatusChange?.(programacion.id, nuevoEstado);
  };

  const getAvailableStatusTransitions = () => {
    const transitions: {
      estado: EstadoProgramacion;
      label: string;
      icon: React.ElementType;
    }[] = [];

    switch (programacion.estado) {
      case "programada":
        transitions.push(
          { estado: "en_proceso", label: "Iniciar", icon: Play },
          { estado: "cancelada", label: "Cancelar", icon: XCircle },
          { estado: "reprogramada", label: "Reprogramar", icon: RefreshCw }
        );
        break;
      case "en_proceso":
        transitions.push(
          { estado: "completada", label: "Completar", icon: CheckCircle },
          { estado: "cancelada", label: "Cancelar", icon: XCircle }
        );
        break;
      case "completada":
        // Solo puede ver
        break;
      case "cancelada":
        transitions.push({
          estado: "reprogramada",
          label: "Reprogramar",
          icon: RefreshCw,
        });
        break;
      case "reprogramada":
        transitions.push({
          estado: "programada",
          label: "Confirmar",
          icon: CheckCircle,
        });
        break;
    }

    return transitions;
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          <Badge className={estadoConfig?.bgColor}>{estadoConfig?.label}</Badge>
          <div>
            <p className="font-medium">{programacion.claveObra}</p>
            <p className="text-sm text-gray-600">
              {format(new Date(programacion.fechaProgramada), "dd/MM/yyyy", {
                locale: es,
              })}{" "}
              - {programacion.horaProgramada}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView?.(programacion.id)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-lg">
                {programacion.claveObra}
              </h3>
              <Badge
                className={`${estadoConfig?.color} ${estadoConfig?.bgColor}`}
              >
                {estadoConfig?.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {programacion.presupuesto?.cliente?.nombre}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(programacion.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalles
              </DropdownMenuItem>

              {programacion.estado === "programada" && onEdit && (
                <DropdownMenuItem onClick={() => onEdit(programacion.id)}>
                  Editar
                </DropdownMenuItem>
              )}

              {getAvailableStatusTransitions().map((transition) => (
                <DropdownMenuItem
                  key={transition.estado}
                  onClick={() => handleStatusChange(transition.estado)}
                >
                  <transition.icon className="h-4 w-4 mr-2" />
                  {transition.label}
                </DropdownMenuItem>
              ))}

              {(programacion.estado === "programada" ||
                programacion.estado === "cancelada") &&
                onDelete && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onDelete(programacion.id)}
                      className="text-red-600"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Fecha y hora */}
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {format(
              new Date(programacion.fechaProgramada),
              "EEEE, dd 'de' MMMM 'de' yyyy",
              { locale: es }
            )}{" "}
            - {programacion.horaProgramada}
          </span>
        </div>

        {/* Ubicación */}
        {programacion.obra?.direccion && (
          <div className="flex items-start space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
            <span className="text-gray-600">{programacion.obra.direccion}</span>
          </div>
        )}

        {/* Brigadista principal */}
        <div className="flex items-center space-x-2 text-sm">
          <User className="h-4 w-4 text-gray-500" />
          <span>
            {programacion.brigadistaPrincipal.nombre}{" "}
            {programacion.brigadistaPrincipal.apellidos}
            {programacion.brigadistaApoyo && (
              <span className="text-gray-500">
                {" + "}
                {programacion.brigadistaApoyo.nombre}{" "}
                {programacion.brigadistaApoyo.apellidos}
              </span>
            )}
          </span>
        </div>

        {/* Vehículo */}
        <div className="flex items-center space-x-2 text-sm">
          <Truck className="h-4 w-4 text-gray-500" />
          <span>{programacion.vehiculo.clave}</span>
          {programacion.vehiculo.marca && (
            <span className="text-gray-500">
              - {programacion.vehiculo.marca} {programacion.vehiculo.modelo}
            </span>
          )}
        </div>

        {/* Actividades */}
        <div className="mt-3">
          <p className="text-sm font-medium mb-2">
            Actividades: {programacion.detalles.length}
          </p>
          <div className="flex flex-wrap gap-1">
            {programacion.detalles.slice(0, 3).map((detalle, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {detalle.cantidadMuestras}{" "}
                {detalle.concepto?.unidad || detalle.unidadMedida}
              </Badge>
            ))}
            {programacion.detalles.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{programacion.detalles.length - 3} más
              </Badge>
            )}
          </div>
        </div>

        {/* Información de fechas de proceso */}
        {programacion.fechaInicio && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Iniciado:{" "}
            {format(new Date(programacion.fechaInicio), "dd/MM/yyyy HH:mm", {
              locale: es,
            })}
          </div>
        )}

        {programacion.fechaComplecion && (
          <div className="text-xs text-gray-500">
            Completado:{" "}
            {format(
              new Date(programacion.fechaComplecion),
              "dd/MM/yyyy HH:mm",
              { locale: es }
            )}
          </div>
        )}

        {programacion.motivoCancelacion && (
          <div className="text-xs text-red-600 pt-2 border-t">
            Motivo de cancelación: {programacion.motivoCancelacion}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
