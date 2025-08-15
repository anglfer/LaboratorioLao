import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardRoute } from "../../features/dashboard/services/dashboardRoutes";
import { useAuth } from "../../features/dashboard/contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { AlertCircle, LogIn, FlaskConical } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, usuario } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      // Obtener usuario del localStorage para saber el rol
      const storedUser = localStorage.getItem("usuario");
      let rol = "";
      if (storedUser) {
        try {
          rol = JSON.parse(storedUser).rol;
        } catch {}
      }
      navigate(getDashboardRoute(rol), { replace: true });
    }
  }, [usuario, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Credenciales incorrectas");
      }
      // No navegamos aquí, lo hace el useEffect cuando usuario cambia
    } catch (error) {
      setError("Error al iniciar sesión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f4f6f8] p-0 md:p-0">
      {/* Fondo izquierdo vacío */}
      <div className="hidden md:flex flex-1" />
      {/* Login a la derecha con animación */}
      <div className="flex flex-1 items-center justify-center md:justify-end px-4 md:px-16 animate-slide-in-left">
        <Card className="w-full max-w-md border border-gray-200 shadow-md rounded-lg bg-white">
          <CardHeader className="text-center flex flex-col items-center gap-2">
            <div className="flex items-center justify-center mb-2">
              <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#e6f4ea] border border-[#b6e2c7]">
                <FlaskConical className="h-8 w-8 text-[#15803d]" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold text-[#15803d] tracking-tight">
              Laboratorio LAO
            </CardTitle>
            <CardDescription className="text-gray-500">
              Acceso para colaboradores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-800 font-medium">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@laboratorio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-800 font-medium">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#22c55e] text-white font-semibold py-2 rounded-md shadow-sm hover:bg-[#16a34a] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-xs text-gray-500">
              ¿Olvidaste tu contraseña?{" "}
              <a href="#" className="text-[#22c55e] hover:underline">
                Contacta soporte
              </a>
            </div>
          </CardContent>
          <div className="text-center text-xs text-gray-400 pb-4 pt-2">
            © {new Date().getFullYear()} Laboratorio LAO. Todos los derechos
            reservados.
          </div>
        </Card>
      </div>
    </div>
  );
}
