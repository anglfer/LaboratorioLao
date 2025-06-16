import { useState } from "react";
import { Button } from "../../../shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../shared/components/ui/tabs";
import { Badge } from "../../../shared/components/ui/badge";
import ProgrammingDashboard from "../components/ProgrammingDashboard";
import ProgramacionForm from "../components/ProgramacionForm";
import ProgramacionList from "../components/ProgramacionList";
import CalendarView from "../components/CalendarView";
import { CalendarDays, Plus, List, BarChart3 } from "lucide-react";
import { useQuickStats } from "../hooks/useProgramming";

export default function ProgrammingPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNewForm, setShowNewForm] = useState(false);
  const { data: quickStats, isLoading: loadingStats } = useQuickStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Programación de Actividades
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión integral de la programación semanal de trabajo de campo
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nueva Programación
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Programaciones Activas
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : quickStats?.programacionesActivas ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : quickStats?.enProceso ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Actividades en campo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>{" "}
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : quickStats?.completadasMes ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard Semanal
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lista de Programaciones
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Vista Calendario
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard">
          <ProgrammingDashboard />
        </TabsContent>
        <TabsContent value="list">
          <ProgramacionList />
        </TabsContent>{" "}
        <TabsContent value="calendar">
          <CalendarView />
        </TabsContent>
      </Tabs>

      {/* New Programming Form Dialog */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Nueva Programación</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewForm(false)}
                >
                  Cancelar
                </Button>
              </div>
              <ProgramacionForm
                onSuccess={() => {
                  setShowNewForm(false);
                  // Refresh data if needed
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
