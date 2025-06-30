import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConceptoSchema } from "../../../../../shared/schema";
import { ConceptoFormData } from "../types/concept";
import {
  useAreas,
  useSubareasByArea,
  useCreateConcepto,
} from "../hooks/useConcepts";
import { ImprovedConceptList } from "./ImprovedConceptList";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared/components/ui/select";
import { Textarea } from "../../../shared/components/ui/textarea";
import { Badge } from "../../../shared/components/ui/badge";
import { BRAND_COLORS } from "../../../shared/constants/brandColors";
import {
  Building,
  MapPin,
  Hash,
  DollarSign,
  Package,
  Plus,
  X,
  CheckCircle,
  Loader2,
} from "lucide-react";

export function ImprovedConceptForm() {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedSubarea, setSelectedSubarea] = useState<number | null>(null);
  const [selectedSubareaName, setSelectedSubareaName] = useState<string>("");
  const [showForm, setShowForm] = useState(false);

  const { data: areas = [], isLoading: areasLoading } = useAreas();
  const { data: subareas = [], isLoading: subareasLoading } = useSubareasByArea(
    selectedArea || null
  );
  const createConcepto = useCreateConcepto();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConceptoFormData>({
    resolver: zodResolver(insertConceptoSchema),
    defaultValues: {
      subareaId: 0,
    },
  });

  // Reset subarea when area changes
  useEffect(() => {
    if (selectedArea && selectedSubarea) {
      const subareaStillValid = subareas.some((s) => s.id === selectedSubarea);
      if (!subareaStillValid) {
        setSelectedSubarea(null);
        setSelectedSubareaName("");
        setValue("subareaId", 0);
      }
    }
  }, [selectedArea, subareas, selectedSubarea, setValue]);

  const onSubmit = async (data: ConceptoFormData) => {
    try {
      await createConcepto.mutateAsync(data);
      reset();
      setShowForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleAreaChange = (areaCodigo: string) => {
    setSelectedArea(areaCodigo);
    setSelectedSubarea(null);
    setSelectedSubareaName("");
    setValue("subareaId", 0);
  };

  const handleSubareaChange = (subareaId: string) => {
    const id = parseInt(subareaId);
    const subarea = subareas.find((s) => s.id === id);
    setSelectedSubarea(id);
    setSelectedSubareaName(subarea?.nombre || "");
    setValue("subareaId", id);
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
  };

  return (
    <div
      className="space-y-6 p-6"
      style={{
        backgroundColor: BRAND_COLORS.backgroundLight,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building
            className="h-8 w-8"
            style={{ color: BRAND_COLORS.primary }}
          />
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: BRAND_COLORS.textPrimary }}
            >
              Gestión de Conceptos
            </h1>
            <p style={{ color: BRAND_COLORS.textSecondary }}>
              Administre conceptos de construcción por área y subárea
            </p>
          </div>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2"
            style={{
              backgroundColor: BRAND_COLORS.primary,
              color: BRAND_COLORS.white,
              border: "none",
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Concepto</span>
          </Button>
        )}
      </div>

      {/* Area and Subarea Selection */}
      <Card
        style={{
          backgroundColor: BRAND_COLORS.white,
          border: `1px solid ${BRAND_COLORS.border}`,
        }}
      >
        <CardHeader>
          <CardTitle
            className="flex items-center space-x-2"
            style={{ color: BRAND_COLORS.textPrimary }}
          >
            <MapPin
              className="h-5 w-5"
              style={{ color: BRAND_COLORS.primary }}
            />
            <span>Selección de Área y Subárea</span>
          </CardTitle>
          <CardDescription style={{ color: BRAND_COLORS.textSecondary }}>
            Seleccione primero el área y luego la subárea para ver y crear
            conceptos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Área Selection */}
            <div className="space-y-3">
              <Label
                htmlFor="area"
                className="flex items-center space-x-2"
                style={{ color: BRAND_COLORS.textPrimary }}
              >
                <Building
                  className="h-4 w-4"
                  style={{ color: BRAND_COLORS.primary }}
                />
                <span>Área</span>
              </Label>
              <Select value={selectedArea} onValueChange={handleAreaChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  {areasLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Cargando áreas...</span>
                      </div>
                    </SelectItem>
                  ) : (
                    areas.map((area) => (
                      <SelectItem key={area.codigo} value={area.codigo}>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {area.codigo}
                          </Badge>
                          <span>{area.nombre}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Subárea Selection */}
            <div className="space-y-3">
              <Label
                htmlFor="subarea"
                className="flex items-center space-x-2"
                style={{ color: BRAND_COLORS.textPrimary }}
              >
                <MapPin
                  className="h-4 w-4"
                  style={{ color: BRAND_COLORS.primary }}
                />
                <span>Subárea</span>
              </Label>
              <Select
                value={selectedSubarea?.toString()}
                onValueChange={handleSubareaChange}
                disabled={!selectedArea}
              >
                <SelectTrigger className="h-12">
                  <SelectValue
                    placeholder={
                      !selectedArea
                        ? "Selecciona primero un área"
                        : "Selecciona una subárea"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subareasLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Cargando subáreas...</span>
                      </div>
                    </SelectItem>
                  ) : subareas.length === 0 && selectedArea ? (
                    <SelectItem value="empty" disabled>
                      No hay subáreas disponibles
                    </SelectItem>
                  ) : (
                    subareas.map((subarea) => (
                      <SelectItem
                        key={subarea.id}
                        value={subarea.id.toString()}
                      >
                        {subarea.nombre}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selected Information */}
          {selectedArea && selectedSubarea && (
            <div
              className="p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: `${BRAND_COLORS.primary}10`,
                borderLeftColor: BRAND_COLORS.primary,
              }}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle
                  className="h-5 w-5"
                  style={{ color: BRAND_COLORS.success }}
                />
                <span
                  className="font-medium"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  Área seleccionada: {selectedArea} - {selectedSubareaName}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Concept Form */}
      {showForm && selectedSubarea && (
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
                  <Hash
                    className="h-5 w-5"
                    style={{ color: BRAND_COLORS.primary }}
                  />
                  <span>Nuevo Concepto</span>
                </CardTitle>
                <CardDescription style={{ color: BRAND_COLORS.textSecondary }}>
                  Completar información del concepto para {selectedSubareaName}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Código del Concepto */}
              <div className="space-y-3">
                <Label
                  htmlFor="codigo"
                  className="flex items-center space-x-2"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  <Hash
                    className="h-4 w-4"
                    style={{ color: BRAND_COLORS.primary }}
                  />
                  <span>Código del Concepto</span>
                </Label>
                <Input
                  id="codigo"
                  {...register("codigo")}
                  placeholder="Ej: CC.001"
                  className="h-12"
                />
                {errors.codigo && (
                  <p className="text-sm" style={{ color: BRAND_COLORS.error }}>
                    {errors.codigo.message}
                  </p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-3">
                <Label
                  htmlFor="descripcion"
                  style={{ color: BRAND_COLORS.textPrimary }}
                >
                  Descripción (Opcional)
                </Label>
                <Textarea
                  id="descripcion"
                  {...register("descripcion")}
                  placeholder="Descripción detallada del concepto"
                  rows={3}
                  className="resize-none"
                />
                {errors.descripcion && (
                  <p className="text-sm" style={{ color: BRAND_COLORS.error }}>
                    {errors.descripcion.message}
                  </p>
                )}
              </div>

              {/* Unidad y Precio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="unidad"
                    className="flex items-center space-x-2"
                    style={{ color: BRAND_COLORS.textPrimary }}
                  >
                    <Package
                      className="h-4 w-4"
                      style={{ color: BRAND_COLORS.primary }}
                    />
                    <span>Unidad</span>
                  </Label>
                  <Input
                    id="unidad"
                    {...register("unidad")}
                    placeholder="Ej: m², kg, pza"
                    className="h-12"
                  />
                  {errors.unidad && (
                    <p
                      className="text-sm"
                      style={{ color: BRAND_COLORS.error }}
                    >
                      {errors.unidad.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="p_u"
                    className="flex items-center space-x-2"
                    style={{ color: BRAND_COLORS.textPrimary }}
                  >
                    <DollarSign
                      className="h-4 w-4"
                      style={{ color: BRAND_COLORS.primary }}
                    />
                    <span>Precio Unitario</span>
                  </Label>
                  <Input
                    id="p_u"
                    type="number"
                    step="0.01"
                    {...register("p_u", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="h-12"
                  />
                  {errors.p_u && (
                    <p
                      className="text-sm"
                      style={{ color: BRAND_COLORS.error }}
                    >
                      {errors.p_u.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2"
                  style={{
                    backgroundColor: BRAND_COLORS.primary,
                    color: BRAND_COLORS.white,
                    border: "none",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Crear Concepto</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Concept List */}
      <ImprovedConceptList
        subareaId={selectedSubarea}
        subareaName={selectedSubareaName}
        onCreateNew={() => setShowForm(true)}
      />
    </div>
  );
}
