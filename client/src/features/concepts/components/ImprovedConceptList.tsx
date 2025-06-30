import { useState } from "react";
import { useConceptosBySubarea } from "../hooks/useConcepts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Badge } from "../../../shared/components/ui/badge";
import { Input } from "../../../shared/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/components/ui/table";
import { BRAND_COLORS } from "../../../shared/constants/brandColors";
import {
  Search,
  Package,
  DollarSign,
  Hash,
  Edit,
  Trash2,
  Plus,
  FileText,
  Loader2,
} from "lucide-react";

interface ImprovedConceptListProps {
  subareaId: number | null;
  subareaName?: string;
  onCreateNew?: () => void;
}

export function ImprovedConceptList({
  subareaId,
  subareaName,
  onCreateNew,
}: ImprovedConceptListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: conceptos = [], isLoading } = useConceptosBySubarea(subareaId);

  const filteredConceptos = conceptos.filter(
    (concepto) =>
      concepto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concepto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concepto.unidad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!subareaId) {
    return (
      <Card
        style={{
          backgroundColor: BRAND_COLORS.white,
          border: `1px solid ${BRAND_COLORS.border}`,
        }}
      >
        <CardContent className="text-center py-12">
          <Package
            className="h-16 w-16 mx-auto mb-4"
            style={{ color: BRAND_COLORS.textSecondary }}
          />
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: BRAND_COLORS.textPrimary }}
          >
            Selecciona una subárea
          </h3>
          <p style={{ color: BRAND_COLORS.textSecondary }}>
            Para ver y gestionar conceptos, primero selecciona un área y subárea
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      style={{
        backgroundColor: BRAND_COLORS.white,
        border: `1px solid ${BRAND_COLORS.border}`,
      }}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle
              className="flex items-center space-x-2"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              <FileText
                className="h-5 w-5"
                style={{ color: BRAND_COLORS.primary }}
              />
              <span>Conceptos Registrados</span>
              {subareaName && (
                <Badge
                  variant="outline"
                  style={{
                    borderColor: BRAND_COLORS.primary,
                    color: BRAND_COLORS.primary,
                  }}
                >
                  {subareaName}
                </Badge>
              )}
            </CardTitle>
            <p
              className="text-sm mt-1"
              style={{ color: BRAND_COLORS.textSecondary }}
            >
              {isLoading
                ? "Cargando..."
                : `${filteredConceptos.length} concepto(s) encontrado(s)`}
            </p>
          </div>

          {onCreateNew && conceptos.length > 0 && (
            <Button
              onClick={onCreateNew}
              size="sm"
              className="flex items-center space-x-2"
              style={{
                backgroundColor: BRAND_COLORS.primary,
                color: BRAND_COLORS.white,
                border: "none",
              }}
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo</span>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2">
              <Loader2
                className="h-5 w-5 animate-spin"
                style={{ color: BRAND_COLORS.primary }}
              />
              <span style={{ color: BRAND_COLORS.textSecondary }}>
                Cargando conceptos...
              </span>
            </div>
          </div>
        ) : conceptos.length === 0 ? (
          <div className="text-center py-12">
            <Package
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: BRAND_COLORS.textSecondary }}
            />
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              No hay conceptos registrados
            </h3>
            <p className="mb-6" style={{ color: BRAND_COLORS.textSecondary }}>
              Esta subárea no tiene conceptos. ¡Crea el primero!
            </p>
            {onCreateNew && (
              <Button
                onClick={onCreateNew}
                className="flex items-center space-x-2"
                style={{
                  backgroundColor: BRAND_COLORS.primary,
                  color: BRAND_COLORS.white,
                  border: "none",
                }}
              >
                <Plus className="h-4 w-4" />
                <span>Crear Primer Concepto</span>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Search */}
            {conceptos.length > 3 && (
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                  style={{ color: BRAND_COLORS.textSecondary }}
                />
                <Input
                  placeholder="Buscar por código, descripción o unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Table */}
            <div
              className="rounded-lg border"
              style={{ borderColor: BRAND_COLORS.border }}
            >
              <Table>
                <TableHeader>
                  <TableRow
                    style={{ backgroundColor: BRAND_COLORS.backgroundLight }}
                  >
                    <TableHead
                      className="w-32"
                      style={{ color: BRAND_COLORS.textPrimary }}
                    >
                      <div className="flex items-center space-x-1">
                        <Hash
                          className="h-4 w-4"
                          style={{ color: BRAND_COLORS.primary }}
                        />
                        <span>Código</span>
                      </div>
                    </TableHead>
                    <TableHead style={{ color: BRAND_COLORS.textPrimary }}>
                      Descripción
                    </TableHead>
                    <TableHead
                      className="w-24 text-center"
                      style={{ color: BRAND_COLORS.textPrimary }}
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <Package
                          className="h-4 w-4"
                          style={{ color: BRAND_COLORS.primary }}
                        />
                        <span>Unidad</span>
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-32 text-right"
                      style={{ color: BRAND_COLORS.textPrimary }}
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <DollarSign
                          className="h-4 w-4"
                          style={{ color: BRAND_COLORS.primary }}
                        />
                        <span>Precio</span>
                      </div>
                    </TableHead>
                    <TableHead
                      className="w-24 text-center"
                      style={{ color: BRAND_COLORS.textPrimary }}
                    >
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConceptos.map((concepto) => (
                    <TableRow
                      key={concepto.codigo}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="font-mono text-xs"
                          style={{
                            borderColor: BRAND_COLORS.primary,
                            color: BRAND_COLORS.primary,
                          }}
                        >
                          {concepto.codigo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          {concepto.descripcion ? (
                            <p
                              className="text-sm"
                              style={{ color: BRAND_COLORS.textPrimary }}
                            >
                              {concepto.descripcion}
                            </p>
                          ) : (
                            <p
                              className="text-sm italic"
                              style={{ color: BRAND_COLORS.textSecondary }}
                            >
                              Sin descripción
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {concepto.unidad}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p
                            className="font-semibold"
                            style={{ color: BRAND_COLORS.primary }}
                          >
                            $
                            {concepto.p_u
                              ? Number(concepto.p_u).toLocaleString("es-MX", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })
                              : "0.00"}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: BRAND_COLORS.textSecondary }}
                          >
                            por {concepto.unidad}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50"
                            title="Editar concepto"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                            title="Eliminar concepto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* No results message */}
            {searchTerm && filteredConceptos.length === 0 && (
              <div className="text-center py-8">
                <Search
                  className="h-12 w-12 mx-auto mb-3"
                  style={{ color: BRAND_COLORS.textSecondary }}
                />
                <p style={{ color: BRAND_COLORS.textPrimary }}>
                  No se encontraron conceptos que coincidan con "{searchTerm}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="mt-2"
                >
                  Limpiar búsqueda
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
