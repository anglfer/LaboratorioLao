import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import {
  FileText,
  Calendar,
  Users,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

export function RecepcionistaDashboard() {
  const navigate = useNavigate();

  const recepcionistaModules = [
    {
      title: "Crear Presupuesto",
      description: "Generar nuevo presupuesto para cliente",
      icon: PlusCircle,
      path: "presupuestos/nuevo",
      color: "bg-green-500",
    },
    {
      title: "Gestionar Presupuestos",
      description: "Ver, editar y aprobar presupuestos",
      icon: FileText,
      path: "presupuestos",
      color: "bg-blue-500",
    },
    {
      title: "Programaciones",
      description: "Crear y gestionar programaciones",
      icon: Calendar,
      path: "programacion",
      color: "bg-purple-500",
    },
    {
      title: "Clientes",
      description: "Administrar información de clientes",
      icon: Users,
      path: "clientes",
      color: "bg-orange-500",
    },
  ];

  const presupuestosEstado = [
    {
      titulo: "Pendientes de Envío",
      cantidad: 5,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      icon: Clock,
    },
    {
      titulo: "Enviados",
      cantidad: 12,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      icon: AlertCircle,
    },
    {
      titulo: "Aprobados",
      cantidad: 8,
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle,
    },
  ];

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Panel de Recepción
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona presupuestos, programaciones y clientes
            </p>
          </div>
          <Link to="presupuestos/nuevo">
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Presupuesto
            </Button>
          </Link>
        </div>

        {/* Estado de Presupuestos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presupuestosEstado.map((estado) => {
            const Icon = estado.icon;
            return (
              <Card key={estado.titulo}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full ${estado.bgColor}`}>
                      <Icon className={`h-6 w-6 ${estado.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {estado.titulo}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {estado.cantidad}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Módulos Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recepcionistaModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.path}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${module.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {module.description}
                  </p>
                  <Link to={module.path} className="w-full block">
                    <Button className="w-full" variant="outline">
                      Acceder
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resumen de Actividades Recientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Presupuestos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Cliente ABC - Obra 001</p>
                    <p className="text-sm text-gray-600">Creado hace 2 horas</p>
                  </div>
                  <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    Borrador
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Cliente XYZ - Obra 002</p>
                    <p className="text-sm text-gray-600">Enviado ayer</p>
                  </div>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Enviado
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Cliente DEF - Obra 003</p>
                    <p className="text-sm text-gray-600">Aprobado hace 1 día</p>
                  </div>
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                    Aprobado
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Programaciones de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Obra 001 - Muestreo</p>
                    <p className="text-sm text-gray-600">
                      09:00 AM - Brigadista Juan
                    </p>
                  </div>
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                    Programada
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">Obra 002 - Inspección</p>
                    <p className="text-sm text-gray-600">
                      11:30 AM - Brigadista María
                    </p>
                  </div>
                  <span className="text-sm px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    En proceso
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Obra 003 - Análisis</p>
                    <p className="text-sm text-gray-600">
                      02:00 PM - Brigadista Carlos
                    </p>
                  </div>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Completada
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Aquí se renderizan las rutas hijas */}
      <Outlet />
    </>
  );
}
