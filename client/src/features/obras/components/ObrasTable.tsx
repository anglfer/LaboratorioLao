import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "../../../shared";
import { Obra } from "../types";

export default function ObrasTable({
  obras,
  onEdit,
  onDelete,
  onView,
}: {
  obras: Obra[];
  onEdit: (obra: Obra) => void;
  onDelete: (obra: Obra) => void;
  onView: (obra: Obra) => void;
}) {
  const estadoBadge = (estado?: number | null) => {
    switch (estado) {
      case 0:
        return <Badge variant="secondary">Borrador</Badge>;
      case 2:
        return <Badge variant="destructive">Cerrada</Badge>;
      default:
        return <Badge>Activa</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Obras</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Clave</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Contratista</TableHead>
              <TableHead>Fecha inicio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {obras.map((obra) => (
              <TableRow key={obra.clave}>
                <TableCell className="font-medium">{obra.clave}</TableCell>
                <TableCell>{obra.areaCodigo}</TableCell>
                <TableCell>{obra.contratista || "-"}</TableCell>
                <TableCell>
                  {obra.fechaInicio
                    ? new Date(obra.fechaInicio).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>{estadoBadge(obra.estado)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onView(obra)}
                  >
                    Ver
                  </Button>
                  <Button size="sm" onClick={() => onEdit(obra)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(obra)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
