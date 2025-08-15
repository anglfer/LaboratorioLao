import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "../../../shared";
import ObrasTable from "../components/ObrasTable";
import ObraForm from "../components/ObraForm";
import {
  useActualizarObra,
  useCrearObra,
  useEliminarObra,
  useObras,
  useAreas,
  usePresupuestosDeObra,
  useDetallesPresupuesto,
  useAgregarDetalle,
  useEliminarDetalle,
} from "../hooks/useObras";
import { Obra } from "../types";
import { useAuth } from "../../dashboard/contexts/AuthContext";
import { useToast } from "../../dashboard/hooks/use-toast";

export default function ObrasPage() {
  const { hasPermission } = useAuth();
  const puedeGestionar = hasPermission("gestionar_obras");
  const { data: obras = [], isLoading } = useObras();
  const { data: areas = [] } = useAreas();
  const crear = useCrearObra();
  const actualizar = useActualizarObra();
  const eliminar = useEliminarObra();
  const { toast } = useToast();

  const [filtroTexto, setFiltroTexto] = useState("");
  const [obraEditando, setObraEditando] = useState<Obra | null>(null);
  const [obraSeleccionada, setObraSeleccionada] = useState<Obra | null>(null);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState<
    number | null
  >(null);

  const { data: presupuestos = [] } = usePresupuestosDeObra(
    obraSeleccionada?.clave
  );
  const { data: detalles = [] } = useDetallesPresupuesto(
    presupuestoSeleccionado ?? undefined
  );
  const agregarDetalle = useAgregarDetalle(presupuestoSeleccionado ?? 0);
  const eliminarDetalle = useEliminarDetalle(presupuestoSeleccionado ?? 0);

  const obrasFiltradas = useMemo(() => {
    const t = filtroTexto.toLowerCase();
    return obras.filter((o) =>
      [o.clave, o.areaCodigo, o.contratista || ""].some((v) =>
        v?.toLowerCase().includes(t)
      )
    );
  }, [obras, filtroTexto]);

  useEffect(() => {
    if (!puedeGestionar) {
      toast({
        title: "Acceso restringido",
        description: "No tienes permisos para gestionar obras",
        variant: "destructive",
      });
    }
  }, [puedeGestionar]);

  const onCrear = async (data: {
    areaCodigo: string;
    contratista?: string;
    estado?: number;
    responsable?: string;
    contacto?: string;
    direccion?: string;
    fechaInicio?: string;
  }) => {
    try {
      await crear.mutateAsync(data);
      toast({
        title: "Obra creada",
        description: "La obra se creó correctamente",
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const onActualizar = async (data: {
    areaCodigo: string;
    contratista?: string;
    estado?: number;
    responsable?: string;
    contacto?: string;
    direccion?: string;
    fechaInicio?: string;
  }) => {
    if (!obraEditando) return;
    try {
      await actualizar.mutateAsync({ clave: obraEditando.clave, data });
      toast({
        title: "Obra actualizada",
        description: "Los cambios se guardaron",
      });
      setObraEditando(null);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const onEliminar = async (obra: Obra) => {
    if (!confirm(`¿Eliminar la obra ${obra.clave}?`)) return;
    try {
      await eliminar.mutateAsync(obra.clave);
      toast({
        title: "Obra eliminada",
        description: `Se eliminó ${obra.clave}`,
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const initialFormValues = obraEditando
    ? {
        areaCodigo: obraEditando.areaCodigo,
        contratista: obraEditando.contratista || undefined,
        estado: obraEditando.estado ?? 1,
      }
    : undefined;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Obras</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="w-full md:w-80">
              <Label>Buscar</Label>
              <Input
                placeholder="Clave, área o contratista"
                value={filtroTexto}
                onChange={(e) => setFiltroTexto(e.target.value)}
              />
            </div>
            <div>
              {puedeGestionar && (
                <Button
                  onClick={() =>
                    setObraEditando({
                      clave: "",
                      areaCodigo: "",
                      estado: 1,
                    } as any)
                  }
                >
                  Nueva Obra
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {puedeGestionar && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ObrasTable
              obras={obrasFiltradas}
              onEdit={(o) => setObraEditando(o)}
              onDelete={onEliminar}
              onView={(o) => setObraSeleccionada(o)}
            />
          </div>
          <div>
            <ObraForm
              initialValues={initialFormValues}
              onSubmit={obraEditando ? onActualizar : onCrear}
              areas={areas}
            />
          </div>
        </div>
      )}

      {!puedeGestionar && (
        <ObrasTable
          obras={obrasFiltradas}
          onEdit={() => {}}
          onDelete={() => {}}
          onView={() => {}}
        />
      )}

      {obraSeleccionada && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos de {obraSeleccionada.clave}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {presupuestos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay presupuestos para esta obra.
                </p>
              ) : (
                <div className="space-y-2">
                  {presupuestos.map((p: any) => (
                    <div
                      key={p.id}
                      className={`p-2 border rounded flex items-center justify-between ${
                        p.id === presupuestoSeleccionado ? "bg-muted" : ""
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium">Presupuesto #{p.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.fechaSolicitud).toLocaleDateString()} •{" "}
                          {p.estado}
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button
                          size="sm"
                          variant={
                            p.id === presupuestoSeleccionado
                              ? "default"
                              : "secondary"
                          }
                          onClick={() => setPresupuestoSeleccionado(p.id)}
                        >
                          Ver conceptos
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Conceptos{" "}
                {presupuestoSeleccionado
                  ? `(Presupuesto #${presupuestoSeleccionado})`
                  : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!presupuestoSeleccionado ? (
                <p className="text-sm text-muted-foreground">
                  Seleccione un presupuesto para ver y gestionar sus conceptos.
                </p>
              ) : detalles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay conceptos en este presupuesto.
                </p>
              ) : (
                <div className="space-y-2">
                  {detalles.map((d: any) => (
                    <div
                      key={d.id}
                      className="p-2 border rounded flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">
                          {d.concepto?.codigo || d.conceptoCodigo} ·{" "}
                          {d.concepto?.descripcion}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {d.cantidad} x $
                          {Number(d.precioUnitario).toLocaleString()}
                        </div>
                      </div>
                      {puedeGestionar && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            try {
                              await eliminarDetalle.mutateAsync(d.id);
                              toast({ title: "Concepto eliminado" });
                            } catch (e: any) {
                              toast({
                                title: "Error",
                                description: e.message,
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {puedeGestionar && presupuestoSeleccionado && (
                <div className="border-t pt-3 space-y-2">
                  <Label>Agregar concepto por código</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Código" id="conceptoCodigo" />
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      id="cantidad"
                      defaultValue={1}
                      className="w-28"
                    />
                    <Input
                      type="number"
                      placeholder="Precio Unitario"
                      id="precio"
                      className="w-40"
                    />
                    <Button
                      onClick={async () => {
                        const conceptoCodigo = (
                          document.getElementById(
                            "conceptoCodigo"
                          ) as HTMLInputElement
                        )?.value;
                        const cantidad = Number(
                          (
                            document.getElementById(
                              "cantidad"
                            ) as HTMLInputElement
                          )?.value || 1
                        );
                        const precioUnitario = Number(
                          (
                            document.getElementById(
                              "precio"
                            ) as HTMLInputElement
                          )?.value || 0
                        );
                        if (!conceptoCodigo)
                          return toast({
                            title: "Ingrese un código de concepto",
                            variant: "destructive",
                          });
                        try {
                          await agregarDetalle.mutateAsync({
                            conceptoCodigo,
                            cantidad,
                            precioUnitario,
                          });
                          toast({ title: "Concepto agregado" });
                        } catch (e: any) {
                          toast({
                            title: "Error",
                            description: e.message,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
