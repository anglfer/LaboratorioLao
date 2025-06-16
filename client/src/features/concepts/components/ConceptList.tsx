import { useConceptosBySubarea } from "../hooks/useConcepts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Badge } from "../../../shared/components/ui/badge";

interface ConceptListProps {
  subareaId: number | null;
  subareaName?: string;
}

export function ConceptList({ subareaId, subareaName }: ConceptListProps) {
  const { data: conceptos = [], isLoading } = useConceptosBySubarea(subareaId);

  if (!subareaId) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">
          Conceptos existentes {subareaName && `en ${subareaName}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-gray-500">Cargando conceptos...</p>
        ) : conceptos.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay conceptos registrados en esta subárea.
          </p>
        ) : (
          <div className="space-y-3">
            {conceptos.map((concepto) => (
              <div
                key={concepto.codigo}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {concepto.codigo}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">
                      {concepto.unidad}
                    </span>
                  </div>
                  {concepto.descripcion && (
                    <p className="text-sm text-gray-600 truncate">
                      {concepto.descripcion}
                    </p>
                  )}{" "}
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-gray-900">
                    ${concepto.p_u ? Number(concepto.p_u).toFixed(2) : "0.00"}
                  </p>
                  <p className="text-xs text-gray-500">por {concepto.unidad}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
