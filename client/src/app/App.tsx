import { Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "../features/dashboard/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, Layout } from "../shared";
import { Dashboard } from "../features/dashboard";
import { Outlet } from "react-router-dom";
import { AdminDashboard } from "../features/dashboard/components/AdminDashboard";
import { RecepcionistaDashboard } from "../features/dashboard/components/RecepcionistaDashboard";
import { BudgetsNew } from "../features/budgets";
import BudgetPDFPreview from "../features/budgets/pages/BudgetPDFPreview";
import { SistemaJerarquicoPage } from "../features/concepts";
import ClientesPage from "../features/clientes/ClientesPage";
import { ObrasNew } from "../features/obras";
import ProgrammingDashboard from "../features/programming/pages/ProgrammingDashboard";
import ProgrammingList from "../features/programming/pages/ProgrammingList";
import ProgrammingNew from "../features/programming/pages/ProgrammingNew";
import NotFound from "./not-found";
import {
  AuthProvider,
  useAuth,
} from "../features/dashboard/contexts/AuthContext";
import { LoginForm } from "../shared/components/LoginForm";
import { RoleBasedDashboard } from "../features/dashboard/components/RoleBasedDashboard";

function AuthenticatedRouter() {
  const { usuario } = useAuth();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<RoleBasedDashboard />} />
        {/* Rutas directas de presupuestos */}
        <Route path="/presupuestos" element={<BudgetsNew />} />
        <Route path="/presupuestos/nuevo" element={<BudgetsNew />} />
        <Route path="/budgets/:id/preview" element={<BudgetPDFPreview />} />
        {/* Rutas administrativas */}
        <Route
          path="/admin/sistema-jerarquico"
          element={<SistemaJerarquicoPage />}
        />
        <Route path="/admin/presupuestos" element={<BudgetsNew />} />
        <Route
          path="/admin/usuarios"
          element={<div>Gestión de Usuarios - En desarrollo</div>}
        />
        <Route path="/admin/obras" element={<ObrasNew />} />
        <Route path="/admin/clientes" element={<ClientesPage />} />
        <Route
          path="/admin/reportes"
          element={<div>Reportes - En desarrollo</div>}
        />
        <Route
          path="/admin/configuracion"
          element={<div>Configuración - En desarrollo</div>}
        />

        {/* Rutas del módulo de programación */}
        <Route path="/programacion" element={<ProgrammingDashboard />} />
        <Route path="/programacion/lista" element={<ProgrammingList />} />
        <Route path="/programacion/nueva" element={<ProgrammingNew />} />
        <Route
          path="/programacion/:id"
          element={<div>Ver Programación - En desarrollo</div>}
        />
        <Route
          path="/programacion/:id/editar"
          element={<div>Editar Programación - En desarrollo</div>}
        />

        {/* Rutas de recepcionista */}
        <Route path="/recepcionista/presupuestos" element={<BudgetsNew />} />
        <Route
          path="/recepcionista/clientes"
          element={<div>Gestión de Clientes - En desarrollo</div>}
        />
        {/* Rutas específicas por rol */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

function Router() {
  const { usuario, isLoading } = useAuth();

  console.log("[App] Router state:", { usuario: usuario?.email, isLoading });

  if (isLoading) {
    console.log("[App] Mostrando spinner de carga...");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) {
    console.log("[App] Usuario no encontrado, mostrando login...");
    return <LoginForm />;
  }

  console.log("[App] Usuario encontrado, mostrando router autenticado...");
  return <AuthenticatedRouter />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
