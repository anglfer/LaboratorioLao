import { Card, CardContent } from "../shared/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">
              404 pagina no encontrada
            </h1>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Quieres agregar el contenido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
