import { ConceptForm } from "../components/ConceptForm";

export function ConceptsNew() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestión de Conceptos
        </h1>
        <p className="text-gray-600 mt-2">
          Administra los conceptos del sistema seleccionando el área y subárea
          correspondiente
        </p>
      </div>

      <ConceptForm />
    </div>
  );
}
