// Programming feature exports

// Pages
export { default as ProgrammingDashboard } from "./pages/ProgrammingDashboard";
export { default as ProgrammingNew } from "./pages/ProgrammingNew";
export { default as ProgrammingList } from "./pages/ProgrammingList";

// Components
export { default as ProgrammingForm } from "./components/ProgrammingForm";
export { default as WeeklyDashboard } from "./components/WeeklyDashboard";
export { default as ProgrammingCard } from "./components/ProgrammingCard";

// Hooks
export * from "./hooks/useProgramming";
export * from "./hooks/useBrigadistas";
export * from "./hooks/useVehiculos";

// Services
export { programmingService } from "./services/programmingService";
export { brigadistaService } from "./services/brigadistaService";
export { vehiculoService } from "./services/vehiculoService";

// Types
export * from "./types/programming";