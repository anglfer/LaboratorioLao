import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../shared/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProgrammingForm from "../components/ProgrammingForm";
import { useCreateProgramming } from "../hooks/useProgramming";
import type { ProgramacionFormData } from "../types/programming";

export default function ProgrammingNew() {
  const navigate = useNavigate();
  const createMutation = useCreateProgramming();

  const handleSubmit = async (data: ProgramacionFormData) => {
    try {
      await createMutation.mutateAsync(data);
      navigate("/programacion");
    } catch (error) {
      console.error("Error creating programming:", error);
    }
  };

  const handleBack = () => {
    navigate("/programacion");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Nueva Programación
          </h1>
          <p className="text-sm text-slate-600">
            Crear nueva programación de actividades de campo
          </p>
        </div>
      </div>

      <ProgrammingForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
      />
    </div>
  );
}
