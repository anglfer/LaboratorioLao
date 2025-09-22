import React from "react";
import ConceptoSelector from "../features/programming/components/ConceptoSelector";

export default function TestConceptoSelector() {
  const handleSelect = (concepto: any) => {
    console.log("Concepto seleccionado:", concepto);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test ConceptoSelector</h1>
      <div className="max-w-md">
        <ConceptoSelector onSelect={handleSelect} />
      </div>
    </div>
  );
}
