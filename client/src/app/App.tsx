import { Switch, Route } from "wouter";
import { queryClient } from "../features/dashboard/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, Layout } from "../shared";
import { Dashboard } from "../features/dashboard";
import { BudgetsNew } from "../features/budgets";
import { ImprovedConceptsPage } from "../features/concepts";
import ProgrammingPage from "../features/programming/pages/ProgrammingPage";
import BrigadistaPage from "../features/programming/pages/BrigadistaPage";
import NotFound from "./not-found";
import { useAuth } from "../features/dashboard/hooks/useAuth";
import { LoginForm } from "../shared/components/LoginForm";
import { RoleBasedDashboard } from "../features/dashboard/components/RoleBasedDashboard";

function AuthenticatedRouter() {
  const { usuario } = useAuth();

  return (
    <Layout>
      <Switch>
        <Route path="/" component={RoleBasedDashboard} />
        {/* Rutas según permisos del usuario */}
        {(usuario?.rol === "admin" || usuario?.rol === "recepcionista") && (
          <>
            <Route path="/presupuestos" component={BudgetsNew} />
            <Route path="/presupuestos/nuevo" component={BudgetsNew} />
            <Route path="/programacion" component={ProgrammingPage} />
          </>
        )}
        {usuario?.rol === "admin" && (
          <>
            <Route path="/admin/concepts" component={ImprovedConceptsPage} />
            <Route
              path="/admin/usuarios"
              component={() => <div>Gestión de Usuarios - En desarrollo</div>}
            />
            <Route
              path="/admin/brigadistas"
              component={() => (
                <div>Gestión de Brigadistas - En desarrollo</div>
              )}
            />
            <Route
              path="/admin/vehiculos"
              component={() => <div>Gestión de Vehículos - En desarrollo</div>}
            />
            <Route
              path="/admin/obras"
              component={() => <div>Gestión de Obras - En desarrollo</div>}
            />
            <Route
              path="/admin/reportes"
              component={() => <div>Reportes - En desarrollo</div>}
            />
            <Route
              path="/admin/configuracion"
              component={() => <div>Configuración - En desarrollo</div>}
            />
          </>
        )}
        {usuario?.rol === "brigadista" && (
          <Route path="/brigadista" component={BrigadistaPage} />
        )}
        {(usuario?.rol === "jefe_laboratorio" ||
          usuario?.rol === "admin" ||
          usuario?.rol === "recepcionista") && (
          <Route path="/programacion" component={ProgrammingPage} />
        )}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return <LoginForm />;
  }

  return <AuthenticatedRouter />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
