import React from "react";

interface SafeDisplayProps {
  value: any;
  fallback?: React.ReactNode;
}

/**
 * Componente que renderiza de forma segura cualquier valor,
 * evitando el error "Objects are not valid as React child"
 */
export function SafeDisplay({ value, fallback = null }: SafeDisplayProps) {
  // Si es null o undefined, devolvemos el fallback
  if (value === null || value === undefined) {
    return <>{fallback}</>;
  }

  // Si es un elemento React válido, lo devolvemos tal cual
  if (React.isValidElement(value)) {
    return <>{value}</>;
  }

  // Si es un valor primitivo (string, number, boolean), lo convertimos a string
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return <>{String(value)}</>;
  }

  // Si es un array, mapeamos cada elemento con SafeDisplay
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((item, index) => (
          <SafeDisplay key={index} value={item} />
        ))}
      </>
    );
  }

  // Si es un objeto, devolvemos una representación JSON del objeto
  if (typeof value === "object") {
    try {
      // Para mostrar en desarrollo, podríamos usar JSON.stringify
      // En producción, mejor devolver un valor por defecto
      console.warn("Objeto pasado directamente como hijo de React:", value);
      return <>{fallback}</>;
    } catch (error) {
      return <>{fallback}</>;
    }
  }

  // Por defecto, devolvemos el fallback
  return <>{fallback}</>;
}
