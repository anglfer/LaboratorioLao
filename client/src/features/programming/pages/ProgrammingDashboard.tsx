import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WeeklyDashboard from "../components/WeeklyDashboard";
import { useUpdateProgrammingStatus } from "../hooks/useProgramming";
import type { EstadoProgramacion } from "../types/programming";

export default function ProgrammingDashboard() {
  const navigate = useNavigate();
  const updateStatusMutation = useUpdateProgrammingStatus();

  const handleProgramacionClick = (programacionId: number) => {
    navigate(`/programacion/${programacionId}`);
  };

  const handleCreateClick = () => {
    navigate("/programacion/nueva");
  };

  const handleStatusChange = (id: number, estado: EstadoProgramacion) => {
    updateStatusMutation.mutate({
      id,
      statusUpdate: { id, estado },
    });
  };

  return (
    <div className="space-y-6">
      <WeeklyDashboard
        onProgramacionClick={handleProgramacionClick}
        onCreateClick={handleCreateClick}
      />
    </div>
  );
}
