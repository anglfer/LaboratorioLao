import { Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "../features/dashboard/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider, Layout } from "../shared";
import { Dashboard } from "../features/dashboard";
import { Outlet } from "react-router-dom";
import { AdminDashboard } from "../features/dashboard/components/AdminDashboard";
import { RecepcionistaDashboard } from "../features/dashboard/components/RecepcionistaDashboard";
import { BudgetsNew } from "../features/budgets";
import { SistemaJerarquicoPage } from "../features/concepts";
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
      <Routes>
        <Route path="/" element={<RoleBasedDashboard />} />
        {/* Rutas directas de presupuestos */}
        <Route path="/presupuestos" element={<BudgetsNew />} />
        <Route path="/presupuestos/nuevo" element={<BudgetsNew />} />
        {/* Rutas de programación */}
        <Route path="/programacion" element={<ProgrammingPage />} />
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
        <Route
          path="/admin/brigadistas"
          element={<div>Gestión de Brigadistas - En desarrollo</div>}
        />
        <Route
          path="/admin/vehiculos"
          element={<div>Gestión de Vehículos - En desarrollo</div>}
        />
        <Route
          path="/admin/obras"
          element={<div>Gestión de Obras - En desarrollo</div>}
        />
        <Route
          path="/admin/reportes"
          element={<div>Reportes - En desarrollo</div>}
        />
        <Route
          path="/admin/configuracion"
          element={<div>Configuración - En desarrollo</div>}
        />
        {/* Rutas de recepcionista */}
        <Route path="/recepcionista/presupuestos" element={<BudgetsNew />} />
        <Route
          path="/recepcionista/programacion"
          element={<ProgrammingPage />}
        />
        <Route
          path="/recepcionista/clientes"
          element={<div>Gestión de Clientes - En desarrollo</div>}
        />
        {/* Rutas específicas por rol */}
        {usuario?.rol === "brigadista" && (
          <Route path="/brigadista" element={<BrigadistaPage />} />
        )}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
