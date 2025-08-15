import { useForm } from "react-hook-form";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../shared";

type FormData = {
  areaCodigo: string;
  contratista?: string;
  estado?: number;
  responsable?: string;
  contacto?: string;
  direccion?: string;
  fechaInicio?: string;
};

export default function ObraForm({
  initialValues,
  onSubmit,
  areas,
  submitting,
}: {
  initialValues?: Partial<FormData>;
  onSubmit: (data: FormData) => void;
  areas?: { codigo: string; nombre?: string | null }[];
  submitting?: boolean;
}) {
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      areaCodigo: initialValues?.areaCodigo || "",
      contratista: initialValues?.contratista || "",
      estado: initialValues?.estado ?? 1,
      responsable: initialValues?.responsable || "",
      contacto: initialValues?.contacto || "",
      direccion: initialValues?.direccion || "",
      fechaInicio: initialValues?.fechaInicio || "",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialValues ? "Editar Obra" : "Nueva Obra"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit({ ...data, estado: Number(data.estado) })
          )}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Área</Label>
              <Select
                value={watch("areaCodigo")}
                onValueChange={(v) => setValue("areaCodigo", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  {areas?.map((a) => (
                    <SelectItem key={a.codigo} value={a.codigo}>
                      {a.codigo} {a.nombre ? `- ${a.nombre}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contratista</Label>
              <Input
                placeholder="Nombre del contratista"
                {...register("contratista")}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <Select
                value={String(watch("estado") ?? "1")}
                onValueChange={(v) => setValue("estado", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Borrador</SelectItem>
                  <SelectItem value="1">Activa</SelectItem>
                  <SelectItem value="2">Cerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Responsable de obra</Label>
              <Input
                placeholder="Nombre del responsable"
                {...register("responsable")}
              />
            </div>
            <div>
              <Label>Contacto</Label>
              <Input
                placeholder="Teléfono o correo de contacto"
                {...register("contacto")}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Dirección</Label>
              <Input
                placeholder="Dirección de la obra"
                {...register("direccion")}
              />
            </div>
            <div>
              <Label>Fecha de inicio</Label>
              <Input type="date" {...register("fechaInicio")} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            {!initialValues && (
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  // Generar clave automáticamente desde el backend
                  try {
                    const area = watch("areaCodigo");
                    if (!area) return;
                    const res = await fetch("/api/obras/generate-clave", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ areaCodigo: area }),
                    });
                    if (!res.ok) throw new Error("No se pudo generar la clave");
                    const data = await res.json();
                    // Mostrar la clave generada con un pequeño hint (se generará de nuevo al crear)
                    alert(`Clave sugerida: ${data.claveObra}`);
                  } catch (e: any) {
                    alert(e.message || "Error generando clave");
                  }
                }}
              >
                Sugerir clave automática
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>
                {initialValues ? "Guardar cambios" : "Crear obra"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
