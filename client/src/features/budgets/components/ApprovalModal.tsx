import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../shared/components/ui/dialog";
import { Button } from "../../../shared/components/ui/button";
import { Label } from "../../../shared/components/ui/label";
import { CheckCircle, User, Building } from "lucide-react";
import { TipoAprobacion } from "../types/budget";

const BRAND_COLORS = {
  primary: "#2E7D32",
  textPrimary: "#1a1a1a",
  textSecondary: "#666",
  error: "#d32f2f",
};

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tipoAprobacion: TipoAprobacion) => void;
  budget: {
    claveObra?: string;
    cliente?: {
      nombre?: string;
    };
  } | null;
  isLoading?: boolean;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  budget,
  isLoading = false,
}) => {
  const [tipoAprobacion, setTipoAprobacion] = React.useState<TipoAprobacion>("cliente");

  const handleConfirm = () => {
    onConfirm(tipoAprobacion);
  };

  React.useEffect(() => {
    if (isOpen) {
      setTipoAprobacion("cliente"); // Reset to default when modal opens
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle
            className="flex items-center space-x-2"
            style={{ color: BRAND_COLORS.textPrimary }}
          >
            <CheckCircle
              className="h-5 w-5"
              style={{ color: BRAND_COLORS.primary }}
            />
            <span>Aprobar Presupuesto</span>
          </DialogTitle>
          <DialogDescription style={{ color: BRAND_COLORS.textSecondary }}>
            Por favor seleccione quién aprobó este presupuesto:
            <strong
              className="block mt-1"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              {budget?.claveObra || "Sin clave"} -{" "}
              {budget?.cliente?.nombre || "Sin cliente"}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label
              className="text-base font-medium"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              Tipo de Aprobación:
            </Label>
            
            <div className="space-y-3">
              <div 
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  tipoAprobacion === "cliente" ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
                onClick={() => setTipoAprobacion("cliente")}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  tipoAprobacion === "cliente" ? "border-green-500 bg-green-500" : "border-gray-300"
                }`}>
                  {tipoAprobacion === "cliente" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" style={{ color: BRAND_COLORS.primary }} />
                  <div>
                    <div className="font-medium">Aprobado por el Cliente</div>
                    <div className="text-sm text-gray-500">
                      El cliente ha dado su aprobación al presupuesto
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  tipoAprobacion === "interno" ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
                onClick={() => setTipoAprobacion("interno")}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  tipoAprobacion === "interno" ? "border-green-500 bg-green-500" : "border-gray-300"
                }`}>
                  {tipoAprobacion === "interno" && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" style={{ color: BRAND_COLORS.primary }} />
                  <div>
                    <div className="font-medium">Aprobación Interna</div>
                    <div className="text-sm text-gray-500">
                      Aprobado internamente por la empresa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1"
              style={{
                backgroundColor: BRAND_COLORS.primary,
                borderColor: BRAND_COLORS.primary,
              }}
            >
              {isLoading ? "Aprobando..." : "Aprobar Presupuesto"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalModal;