import React, { useState } from "react";
import {
  useClientes,
  useCreateCliente,
  useUpdateCliente,
  useDeleteCliente,
} from "./hooks/useClientes";
import type { Cliente, Telefono, Correo, DatosFacturacion } from "./lib/types";
import { MetodoPago, RegimenFiscal, UsoCFDI, TipoPago } from "./lib/types";
import { Button } from "../../shared/components/ui/button";
import { useToast } from "../../features/dashboard/hooks/use-toast";
import {
  User,
  Search,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  Download,
  Upload,
  Eye,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../shared/components/ui/table";
import { Input } from "../../shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/components/ui/select";
import { ModalImportarClientes } from "./components/ModalImportarClientes";

function ClienteForm({
  initialData,
  onSubmit,
  onCancel,
  loading,
}: {
  initialData?: Partial<Cliente>;
  onSubmit: (data: Partial<Cliente>) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  // Estados para información básica
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [direccion, setDireccion] = useState(initialData?.direccion || "");
  const [representanteLegal, setRepresentanteLegal] = useState(
    initialData?.representanteLegal || ""
  );
  const [contactoPagos, setContactoPagos] = useState(
    initialData?.contactoPagos || ""
  );
  const [telefonoPagos, setTelefonoPagos] = useState(
    initialData?.telefonoPagos || ""
  );
  const [metodoPago, setMetodoPago] = useState<MetodoPago>(
    initialData?.metodoPago || MetodoPago.EFECTIVO
  );
  const [correoFacturacion, setCorreoFacturacion] = useState(
    initialData?.correoFacturacion || ""
  );

  // Estados para contactos
  const [telefonos, setTelefonos] = useState<Telefono[]>(
    initialData?.telefonos || []
  );
  const [correos, setCorreos] = useState<Correo[]>(initialData?.correos || []);
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");

  // Estados para datos de facturación
  const [rfc, setRfc] = useState(initialData?.datosFacturacion?.rfc || "");
  const [regimenFiscal, setRegimenFiscal] = useState<RegimenFiscal>(
    initialData?.datosFacturacion?.regimenFiscal ||
      RegimenFiscal.PERSONAS_FISICAS_CON_ACTIVIDADES_EMPRESARIALES
  );
  const [usoCfdi, setUsoCfdi] = useState<UsoCFDI>(
    initialData?.datosFacturacion?.usoCfdi || UsoCFDI.GASTOS_EN_GENERAL
  );
  const [tipoPago, setTipoPago] = useState<TipoPago>(
    initialData?.datosFacturacion?.tipoPago || TipoPago.PUE
  );

  const handleAddTelefono = () => {
    if (nuevoTelefono.trim() && nuevoTelefono.length === 10) {
      setTelefonos([
        ...telefonos,
        { id: Date.now(), clienteId: 0, telefono: nuevoTelefono },
      ]);
      setNuevoTelefono("");
    }
  };

  const handleRemoveTelefono = (id: number) =>
    setTelefonos(telefonos.filter((t) => t.id !== id));

  const handleAddCorreo = () => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (nuevoCorreo.trim() && emailRegex.test(nuevoCorreo)) {
      setCorreos([
        ...correos,
        { id: Date.now(), clienteId: 0, correo: nuevoCorreo },
      ]);
      setNuevoCorreo("");
    }
  };

  const handleRemoveCorreo = (id: number) =>
    setCorreos(correos.filter((c) => c.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const datosFacturacion = rfc.trim()
      ? {
          id: 0, // Será asignado por la base de datos
          clienteId: 0, // Será asignado por la base de datos
          rfc,
          regimenFiscal,
          usoCfdi,
          tipoPago,
        }
      : undefined;

    onSubmit({
      nombre,
      direccion,
      representanteLegal,
      contactoPagos,
      telefonoPagos,
      metodoPago,
      correoFacturacion,
      telefonos,
      correos,
      datosFacturacion,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto"
    >
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Información Básica
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre o Razón Social *
            </label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="text-sm"
              placeholder="Nombre del cliente o empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección Fiscal o de Contacto
            </label>
            <Input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="text-sm"
              placeholder="Dirección completa"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Representante Legal
            </label>
            <Input
              value={representanteLegal}
              onChange={(e) => setRepresentanteLegal(e.target.value)}
              className="text-sm"
              placeholder="Solo si es empresa o persona moral"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago
            </label>
            <Select
              value={metodoPago}
              onValueChange={(value: MetodoPago) => setMetodoPago(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MetodoPago.EFECTIVO}>Efectivo</SelectItem>
                <SelectItem value={MetodoPago.TRANSFERENCIA}>
                  Transferencia
                </SelectItem>
                <SelectItem value={MetodoPago.CHEQUE}>Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contacto para Pagos */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Contacto para Seguimiento de Pagos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Contacto
            </label>
            <Input
              value={contactoPagos}
              onChange={(e) => setContactoPagos(e.target.value)}
              className="text-sm"
              placeholder="Persona responsable de pagos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono de Contacto
            </label>
            <Input
              value={telefonoPagos}
              onChange={(e) => {
                // Solo permitir números
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setTelefonoPagos(value);
                }
              }}
              className="text-sm"
              placeholder="4771234567 (10 dígitos)"
              maxLength={10}
            />
            {telefonoPagos &&
              telefonoPagos.length > 0 &&
              telefonoPagos.length !== 10 && (
                <p className="text-xs text-red-500 mt-1">
                  El teléfono debe tener exactamente 10 dígitos
                </p>
              )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo para Facturas
          </label>
          <Input
            type="email"
            value={correoFacturacion}
            onChange={(e) => setCorreoFacturacion(e.target.value)}
            className="text-sm"
            placeholder="correo@ejemplo.com"
          />
        </div>
      </div>

      {/* Datos de Facturación */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">
          Datos de Facturación
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RFC
            </label>
            <Input
              value={rfc}
              onChange={(e) => setRfc(e.target.value.toUpperCase())}
              className="text-sm"
              placeholder="ABC123456789 (3-4 letras + 6 números + 3 caracteres)"
              maxLength={13}
            />
            {rfc &&
              rfc.length > 0 &&
              !/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(rfc) && (
                <p className="text-xs text-red-500 mt-1">
                  RFC inválido. Formato: ABC123456789 (3-4 letras + 6 números +
                  3 caracteres)
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Régimen Fiscal
            </label>
            <Select
              value={regimenFiscal}
              onValueChange={(value: RegimenFiscal) => setRegimenFiscal(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona régimen fiscal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={
                    RegimenFiscal.PERSONAS_FISICAS_CON_ACTIVIDADES_EMPRESARIALES
                  }
                >
                  Personas Físicas con Actividades Empresariales
                </SelectItem>
                <SelectItem value={RegimenFiscal.PERSONAS_MORALES}>
                  Personas Morales
                </SelectItem>
                <SelectItem
                  value={RegimenFiscal.REGIMEN_SIMPLIFICADO_DE_CONFIANZA}
                >
                  Régimen Simplificado de Confianza
                </SelectItem>
                <SelectItem
                  value={
                    RegimenFiscal.PERSONAS_FISICAS_CON_ACTIVIDADES_PROFESIONALES
                  }
                >
                  Personas Físicas con Actividades Profesionales
                </SelectItem>
                <SelectItem
                  value={RegimenFiscal.REGIMEN_DE_INCORPORACION_FISCAL}
                >
                  Régimen de Incorporación Fiscal
                </SelectItem>
                <SelectItem value={RegimenFiscal.OTROS}>Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Uso de CFDI
            </label>
            <Select
              value={usoCfdi}
              onValueChange={(value: UsoCFDI) => setUsoCfdi(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona uso de CFDI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UsoCFDI.GASTOS_EN_GENERAL}>
                  Gastos en General
                </SelectItem>
                <SelectItem value={UsoCFDI.EQUIPOS_DE_COMPUTO}>
                  Equipos de Cómputo
                </SelectItem>
                <SelectItem value={UsoCFDI.HONORARIOS_MEDICOS}>
                  Honorarios Médicos
                </SelectItem>
                <SelectItem value={UsoCFDI.GASTOS_MEDICOS}>
                  Gastos Médicos
                </SelectItem>
                <SelectItem value={UsoCFDI.INTERESES_REALES}>
                  Intereses Reales
                </SelectItem>
                <SelectItem value={UsoCFDI.DONACIONES}>Donaciones</SelectItem>
                <SelectItem value={UsoCFDI.OTROS}>Otros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Pago
            </label>
            <Select
              value={tipoPago}
              onValueChange={(value: TipoPago) => setTipoPago(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TipoPago.PUE}>
                  PUE - Pago en Una Sola Exhibición
                </SelectItem>
                <SelectItem value={TipoPago.PPD}>
                  PPD - Pago en Parcialidades o Diferido
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Contactos Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfonos Adicionales
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={nuevoTelefono}
              onChange={(e) => {
                // Solo permitir números
                const value = e.target.value.replace(/\D/g, "");
                if (value.length <= 10) {
                  setNuevoTelefono(value);
                }
              }}
              placeholder="4771234567 (10 dígitos)"
              className="text-sm"
              maxLength={10}
            />
            <Button
              type="button"
              onClick={handleAddTelefono}
              variant="outline"
              size="sm"
              disabled={nuevoTelefono.length !== 10}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {telefonos.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
              >
                <span>{t.telefono}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTelefono(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correos Adicionales
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              type="email"
              value={nuevoCorreo}
              onChange={(e) => setNuevoCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="text-sm"
            />
            <Button
              type="button"
              onClick={handleAddCorreo}
              variant="outline"
              size="sm"
              disabled={
                !nuevoCorreo.trim() ||
                !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                  nuevoCorreo
                )
              }
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {correos.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
              >
                <span>{c.correo}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCorreo(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cliente"}
        </Button>
      </div>
    </form>
  );
}

// Función para exportar a CSV
const exportToCSV = (clientes: Cliente[]) => {
  const headers = ["ID", "Nombre", "Dirección", "Teléfonos", "Correos"];
  const csvContent = [
    headers.join(","),
    ...clientes.map((cliente) =>
      [
        cliente.id,
        `"${cliente.nombre || ""}"`,
        `"${cliente.direccion || ""}"`,
        `"${cliente.telefonos?.map((t) => t.telefono).join("; ") || ""}"`,
        `"${cliente.correos?.map((c) => c.correo).join("; ") || ""}"`,
      ].join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `clientes_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para importar CSV
const importFromCSV = (
  file: File,
  onImport: (clientes: Partial<Cliente>[]) => void
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("El archivo CSV debe contener al menos una fila de datos");
        return;
      }

      // Saltar la primera línea (headers)
      const dataLines = lines.slice(1);

      const clientesImportados: Partial<Cliente>[] = dataLines
        .map((line, index) => {
          try {
            // Parsear CSV manualmente para manejar comillas
            const values: string[] = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === "," && !inQuotes) {
                values.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            values.push(current.trim());

            if (values.length < 3) {
              throw new Error(`Fila ${index + 2}: Datos insuficientes`);
            }

            const [, nombre, direccion, telefonosStr, correosStr] = values;

            const telefonos: Telefono[] = telefonosStr
              ? telefonosStr
                  .split(";")
                  .map((tel, idx) => ({
                    id: Date.now() + idx,
                    clienteId: 0,
                    telefono: tel.trim().replace(/"/g, ""),
                  }))
                  .filter((t) => t.telefono)
              : [];

            const correos: Correo[] = correosStr
              ? correosStr
                  .split(";")
                  .map((email, idx) => ({
                    id: Date.now() + idx + 1000,
                    clienteId: 0,
                    correo: email.trim().replace(/"/g, ""),
                  }))
                  .filter((c) => c.correo)
              : [];

            return {
              nombre: nombre?.replace(/"/g, "") || "",
              direccion: direccion?.replace(/"/g, "") || "",
              telefonos,
              correos,
            };
          } catch (error) {
            console.warn(`Error en fila ${index + 2}:`, error);
            return null;
          }
        })
        .filter(Boolean) as Partial<Cliente>[];

      if (clientesImportados.length === 0) {
        alert(
          "No se pudieron importar clientes. Verifica el formato del archivo."
        );
        return;
      }

      onImport(clientesImportados);
    } catch (error) {
      alert(
        "Error al leer el archivo CSV. Verifica que el formato sea correcto."
      );
      console.error("Error importing CSV:", error);
    }
  };

  reader.readAsText(file, "utf-8");
};

// Función para procesar texto pegado desde Excel
const procesarTextoPegado = (texto: string): Partial<Cliente>[] => {
  const lineas = texto.split("\n").filter((line) => line.trim());

  if (lineas.length === 0) {
    throw new Error("No hay datos para procesar");
  }

  const clientesImportados: Partial<Cliente>[] = lineas.map((linea, index) => {
    try {
      // Dividir por tabulaciones (formato de Excel)
      const columnas = linea.split("\t").map((col) => col.trim());

      if (columnas.length < 1 || !columnas[0]) {
        throw new Error(`Fila ${index + 1}: Falta el nombre del cliente`);
      }

      const [nombre, direccion = "", telefonosStr = "", correosStr = ""] =
        columnas;

      // Limpiar direccion de comillas y espacios extra
      const direccionLimpia = direccion
        .replace(/^["']|["']$/g, "") // Quitar comillas del inicio y final
        .replace(/\s+/g, " ") // Normalizar espacios múltiples
        .trim();

      // Procesar teléfonos múltiples (soporta tanto ; como ,)
      const telefonos: Telefono[] = telefonosStr
        ? telefonosStr
            .split(/[;,]/) // Dividir por ; o ,
            .map((tel, idx) => ({
              id: Date.now() + idx, // ID temporal
              clienteId: 0, // Será asignado por la base de datos
              telefono: tel.trim().replace(/\D/g, ""), // Solo números
            }))
            .filter((t) => t.telefono && t.telefono.length >= 10) // Mínimo 10 dígitos
        : [];

      // Procesar correos múltiples (soporta tanto ; como ,)
      const correos: Correo[] = correosStr
        ? correosStr
            .split(/[;,]/) // Dividir por ; o ,
            .map((email, idx) => ({
              id: Date.now() + idx, // ID temporal
              clienteId: 0, // Será asignado por la base de datos
              correo: email.trim().toLowerCase(),
            }))
            .filter((c) => {
              // Validar formato básico de email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return c.correo && emailRegex.test(c.correo);
            })
        : [];

      return {
        nombre: nombre.trim(),
        direccion: direccionLimpia || undefined,
        telefonos,
        correos,
      };
    } catch (error) {
      console.warn(`Error en fila ${index + 1}:`, error);
      throw new Error(
        `Error en fila ${index + 1}: ${
          error instanceof Error ? error.message : "Formato inválido"
        }`
      );
    }
  });

  return clientesImportados.filter(Boolean);
};

export default function ClientesPage() {
  const { data: clientes, isLoading, error } = useClientes();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [viewingDetails, setViewingDetails] = useState<Cliente | null>(null);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const filteredClientes = (clientes || []).filter(
    (c) =>
      c.id.toString().includes(search) ||
      c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      c.direccion?.toLowerCase().includes(search.toLowerCase()) ||
      c.telefonos?.some((t) => t.telefono.includes(search)) ||
      c.correos?.some((e) =>
        e.correo.toLowerCase().includes(search.toLowerCase())
      )
  );

  const handleEdit = (cliente: Cliente) => {
    setEditing(cliente);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Eliminar este cliente?")) {
      deleteCliente.mutate(id, {
        onSuccess: () => {
          toast({
            title: "Cliente eliminado",
            description: "El cliente se ha eliminado correctamente.",
          });
        },
        onError: handleError,
      });
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleImportFile = (file: File) => {
    setImporting(true);
    importFromCSV(file, async (clientesImportados) => {
      try {
        let importados = 0;
        let errores = 0;

        for (const clienteData of clientesImportados) {
          try {
            await createCliente.mutateAsync(clienteData);
            importados++;
          } catch (error) {
            console.error("Error importing client:", error);
            errores++;
          }
        }

        alert(
          `Importación completada: ${importados} clientes importados${
            errores > 0 ? `, ${errores} errores` : ""
          }`
        );
      } catch (error) {
        alert("Error durante la importación");
        console.error("Import error:", error);
      } finally {
        setImporting(false);
      }
    });
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    setEditing(null);
    toast({
      title: "Cliente guardado",
      description: "El cliente se ha guardado correctamente.",
    });
  };

  const handleError = (error: any) => {
    console.error("Error al guardar cliente:", error);

    // Intentar extraer el mensaje de error más específico
    let errorMessage = "Error al guardar el cliente";

    if (error?.response?.data?.errors) {
      // Si hay errores de validación
      const validationErrors = error.response.data.errors;
      errorMessage = validationErrors.map((err: any) => err.message).join(", ");
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleImportarTexto = async (texto: string) => {
    setImporting(true);
    try {
      const clientesImportados = procesarTextoPegado(texto);

      let importados = 0;
      let errores = 0;

      for (const clienteData of clientesImportados) {
        try {
          await createCliente.mutateAsync(clienteData);
          importados++;
        } catch (error) {
          console.error("Error importing client:", error);
          errores++;
        }
      }

      alert(
        `Importación completada: ${importados} clientes importados${
          errores > 0 ? `, ${errores} errores` : ""
        }`
      );
      setShowImportModal(false);
    } catch (error) {
      alert(
        `Error durante la importación: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`
      );
      console.error("Import error:", error);
    } finally {
      setImporting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-lg mb-4">
            Error al cargar clientes
          </div>
          <p className="text-gray-600">Por favor, intenta recargar la página</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header minimalista */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">
                Clientes
              </h1>
              <p className="text-gray-600 text-sm">
                {clientes?.length || 0} cliente
                {(clientes?.length || 0) !== 1 ? "s" : ""} registrado
                {(clientes?.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToCSV(filteredClientes)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={handleImportClick}
                disabled={importing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                {importing ? "Importando..." : "Importar"}
              </button>
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditing(null);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Nuevo
              </Button>
            </div>
          </div>
        </div>

        {/* Buscador minimalista */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Contenido principal */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">Cargando...</p>
            </div>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? "Sin resultados" : "Sin clientes"}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {search
                ? "No se encontraron clientes con esos criterios"
                : "Agrega tu primer cliente"}
            </p>
            {!search && (
              <Button
                onClick={() => {
                  setShowForm(true);
                  setEditing(null);
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Agregar cliente
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      ID
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      Nombre/Razón Social
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      Dirección
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      Contacto Pagos
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      Método Pago
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      RFC
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3 text-center">
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientes.map((cliente, index) => (
                    <TableRow
                      key={cliente.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <TableCell className="px-4 py-3 text-sm font-medium">
                        {cliente.id}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <div>
                          {cliente.nombre || "Sin nombre"}
                          {cliente.representanteLegal && (
                            <div className="text-xs text-gray-500 mt-1">
                              Rep. Legal: {cliente.representanteLegal}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600">
                        <div
                          className="max-w-xs truncate"
                          title={cliente.direccion || ""}
                        >
                          {cliente.direccion || "Sin dirección"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <div>
                          {cliente.contactoPagos && (
                            <div className="text-xs text-gray-700">
                              {cliente.contactoPagos}
                            </div>
                          )}
                          {cliente.telefonoPagos && (
                            <div className="text-xs text-gray-500">
                              Tel: {cliente.telefonoPagos}
                            </div>
                          )}
                          {!cliente.contactoPagos && !cliente.telefonoPagos && (
                            <span className="text-gray-400 text-xs">
                              Sin contacto
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        <div>
                          {cliente.metodoPago && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {cliente.metodoPago}
                            </span>
                          )}
                          {cliente.correoFacturacion && (
                            <div
                              className="text-xs text-gray-500 mt-1 truncate"
                              title={cliente.correoFacturacion}
                            >
                              {cliente.correoFacturacion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        {cliente.datosFacturacion?.rfc ? (
                          <div>
                            <div className="font-mono text-xs">
                              {cliente.datosFacturacion.rfc}
                            </div>
                            <div className="text-xs text-gray-500">
                              {cliente.datosFacturacion.tipoPago}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Sin RFC</span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingDetails(cliente)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Ver detalles"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(cliente)}
                            className="h-8 w-8 p-0"
                            title="Editar"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(cliente.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar"
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
          </div>
        )}

        {/* Modal de formulario */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-medium">
                {editing ? "Editar cliente" : "Nuevo cliente"}
              </DialogTitle>
            </DialogHeader>
            <ClienteForm
              initialData={editing || undefined}
              loading={createCliente.isPending || updateCliente.isPending}
              onCancel={() => setShowForm(false)}
              onSubmit={(data) => {
                if (editing) {
                  updateCliente.mutate(
                    { id: editing.id, data },
                    {
                      onSuccess: handleCreateSuccess,
                      onError: handleError,
                    }
                  );
                } else {
                  createCliente.mutate(data, {
                    onSuccess: handleCreateSuccess,
                    onError: handleError,
                  });
                }
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Modal de importar clientes */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <ModalImportarClientes
              onImportar={handleImportarTexto}
              onCancelar={() => setShowImportModal(false)}
              cargando={importing}
            />
          </div>
        )}

        {/* Modal de detalles del cliente */}
        <Dialog
          open={!!viewingDetails}
          onOpenChange={() => setViewingDetails(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Detalles del Cliente
              </DialogTitle>
            </DialogHeader>

            {viewingDetails && (
              <div className="space-y-6">
                {/* Información Básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Información Básica
                    </h3>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Nombre o Razón Social
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {viewingDetails.nombre || "No especificado"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Dirección Fiscal
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {viewingDetails.direccion || "No especificado"}
                      </p>
                    </div>

                    {viewingDetails.representanteLegal && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Representante Legal
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {viewingDetails.representanteLegal}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Método de Pago
                      </label>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                        {viewingDetails.metodoPago || "No especificado"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Contacto para Pagos
                    </h3>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Nombre de Contacto
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {viewingDetails.contactoPagos || "No especificado"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Teléfono de Contacto
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {viewingDetails.telefonoPagos || "No especificado"}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Correo para Facturas
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {viewingDetails.correoFacturacion || "No especificado"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datos de Facturación */}
                {viewingDetails.datosFacturacion && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Datos de Facturación
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          RFC
                        </label>
                        <p className="text-sm font-mono text-gray-900 mt-1">
                          {viewingDetails.datosFacturacion.rfc}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Régimen Fiscal
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {viewingDetails.datosFacturacion.regimenFiscal.replace(
                            /_/g,
                            " "
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Uso de CFDI
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {viewingDetails.datosFacturacion.usoCfdi.replace(
                            /_/g,
                            " "
                          )}
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Tipo de Pago
                        </label>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                          {viewingDetails.datosFacturacion.tipoPago} -{" "}
                          {viewingDetails.datosFacturacion.tipoPago === "PUE"
                            ? "Pago en Una Sola Exhibición"
                            : "Pago en Parcialidades o Diferido"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contactos Adicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Teléfonos Adicionales
                    </h3>
                    {viewingDetails.telefonos &&
                    viewingDetails.telefonos.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        {viewingDetails.telefonos.map((telefono) => (
                          <div
                            key={telefono.id}
                            className="flex items-center gap-2"
                          >
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900">
                              {telefono.telefono}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-4">
                        No hay teléfonos adicionales
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                      Correos Adicionales
                    </h3>
                    {viewingDetails.correos &&
                    viewingDetails.correos.length > 0 ? (
                      <div className="space-y-2 mt-4">
                        {viewingDetails.correos.map((correo) => (
                          <div
                            key={correo.id}
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-900 break-all">
                              {correo.correo}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mt-4">
                        No hay correos adicionales
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={() => setViewingDetails(null)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
