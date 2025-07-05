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
import { ConceptList } from "./ConceptList";
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

export function ConceptForm() {
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedSubarea, setSelectedSubarea] = useState<number | null>(null);
  const [selectedSubareaName, setSelectedSubareaName] = useState<string>("");
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
      // Check if current subarea belongs to selected area
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
      // Reset form and subarea state
      reset();
      setSelectedArea("");
      setSelectedSubarea(null);
      setSelectedSubareaName("");
      setValue("subareaId", 0); // Asegura que el valor en el formulario también se reinicie
      // Forzar el valor del Select de subárea a vacío para evitar desincronización visual
      document.activeElement && (document.activeElement as HTMLElement).blur();
    } catch (error) {
      // Error handling is done in the hook
    }
  };
  const handleAreaChange = (areaCodigo: string) => {
    setSelectedArea(areaCodigo);
    setSelectedSubarea(null);
    setSelectedSubareaName("");
    setValue("subareaId", 0); // Reset subarea
  };

  const handleSubareaChange = (subareaId: string) => {
    const id = parseInt(subareaId);
    const subarea = subareas.find((s) => s.id === id);
    setSelectedSubarea(id);
    setSelectedSubareaName(subarea?.nombre || "");
    setValue("subareaId", id);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">Agregar Nuevo Concepto</CardTitle>
        <CardDescription>
          Selecciona el área y subárea, luego completa los datos del concepto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Selección de Área */}
          <div className="space-y-2">
            <Label htmlFor="area">Área</Label>
            <Select value={selectedArea} onValueChange={handleAreaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                {areasLoading ? (
                  <SelectItem value="loading" disabled>
                    Cargando áreas...
                  </SelectItem>
                ) : (
                  areas.map((area) => (
                    <SelectItem key={area.codigo} value={area.codigo}>
                      {area.codigo} - {area.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>{" "}
          {/* Selección de Subárea */}
          <div className="space-y-2">
            <Label htmlFor="subarea">Subárea</Label>{" "}
            <Select
              value={
                selectedSubarea !== null && selectedSubarea > 0
                  ? selectedSubarea.toString()
                  : ""
              }
              onValueChange={handleSubareaChange}
              disabled={!selectedArea}
              key={selectedArea + "-" + (selectedSubarea ?? "")} // Forzar re-render cuando cambia
            >
              <SelectTrigger>
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
                    Cargando subáreas...
                  </SelectItem>
                ) : subareas.length === 0 && selectedArea ? (
                  <SelectItem value="empty" disabled>
                    No hay subáreas disponibles
                  </SelectItem>
                ) : (
                  subareas.map((subarea) => (
                    <SelectItem key={subarea.id} value={subarea.id.toString()}>
                      {subarea.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.subareaId && (
              <p className="text-sm text-red-600">{errors.subareaId.message}</p>
            )}
          </div>
          {/* Formulario de Concepto */}
          {selectedSubarea && selectedSubarea > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código del Concepto</Label>
                <Input
                  id="codigo"
                  {...register("codigo")}
                  placeholder="Ej: CC.001"
                />
                {errors.codigo && (
                  <p className="text-sm text-red-600">
                    {errors.codigo.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción (Opcional)</Label>
                <Textarea
                  id="descripcion"
                  {...register("descripcion")}
                  placeholder="Descripción del concepto"
                  rows={3}
                />
                {errors.descripcion && (
                  <p className="text-sm text-red-600">
                    {errors.descripcion.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unidad">Unidad</Label>
                  <Input
                    id="unidad"
                    {...register("unidad")}
                    placeholder="Ej: m², kg, pza"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p_u">Precio Unitario</Label>
                  <Input
                    id="p_u"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("p_u", { valueAsNumber: true })}
                  />
                  {errors.p_u && (
                    <p className="text-sm text-red-600">{errors.p_u.message}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || !(selectedSubarea && selectedSubarea > 0)
                  }
                >
                  {isSubmitting ? "Guardando..." : "Guardar Concepto"}
                </Button>
              </div>
            </>
          )}
        </form>

        {/* Lista de conceptos existentes */}
        <ConceptList
          subareaId={selectedSubarea}
          subareaName={selectedSubareaName}
        />
      </CardContent>
    </Card>
  );
}
