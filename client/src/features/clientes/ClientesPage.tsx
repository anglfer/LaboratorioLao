import React, { useState } from "react";
import {
  useClientes,
  useCreateCliente,
  useUpdateCliente,
  useDeleteCliente,
} from "./hooks/useClientes";
import type { Cliente, Telefono, Correo } from "./lib/types";
import { Button } from "../../shared/components/ui/button";
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
  const [nombre, setNombre] = useState(initialData?.nombre || "");
  const [direccion, setDireccion] = useState(initialData?.direccion || "");
  const [telefonos, setTelefonos] = useState<Telefono[]>(
    initialData?.telefonos || []
  );
  const [correos, setCorreos] = useState<Correo[]>(initialData?.correos || []);
  const [nuevoTelefono, setNuevoTelefono] = useState("");
  const [nuevoCorreo, setNuevoCorreo] = useState("");

  const handleAddTelefono = () => {
    if (nuevoTelefono.trim()) {
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
    if (nuevoCorreo.trim()) {
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
    onSubmit({ nombre, direccion, telefonos, correos });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
          </label>
          <Input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfonos
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={nuevoTelefono}
              onChange={(e) => setNuevoTelefono(e.target.value)}
              placeholder="Agregar teléfono"
              className="text-sm"
            />
            <Button
              type="button"
              onClick={handleAddTelefono}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
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
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correos
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={nuevoCorreo}
              onChange={(e) => setNuevoCorreo(e.target.value)}
              placeholder="Agregar correo"
              className="text-sm"
            />
            <Button
              type="button"
              onClick={handleAddCorreo}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            {correos.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm"
              >
                <span className="break-all">{c.correo}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCorreo(c.id)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} size="sm">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Guardando..." : "Guardar"}
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

      // Procesar teléfonos múltiples
      const telefonos: Telefono[] = telefonosStr
        ? telefonosStr
            .split(";")
            .map((tel, idx) => ({
              id: Date.now() + index * 1000 + idx,
              clienteId: 0,
              telefono: tel.trim(),
            }))
            .filter((t) => t.telefono)
        : [];

      // Procesar correos múltiples
      const correos: Correo[] = correosStr
        ? correosStr
            .split(";")
            .map((email, idx) => ({
              id: Date.now() + index * 1000 + idx + 500,
              clienteId: 0,
              correo: email.trim(),
            }))
            .filter((c) => c.correo)
        : [];

      return {
        nombre: nombre.trim(),
        direccion: direccion.trim() || undefined,
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
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
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
      deleteCliente.mutate(id);
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
                      Nombre
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      Dirección
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      Teléfonos
                    </TableHead>
                    <TableHead className="font-medium text-gray-900 px-4 py-3">
                      Correos
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
                        {cliente.nombre || "Sin nombre"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm text-gray-600">
                        {cliente.direccion || "Sin dirección"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        {cliente.telefonos && cliente.telefonos.length > 0 ? (
                          <div className="space-y-1">
                            {cliente.telefonos.map((telefono) => (
                              <div
                                key={telefono.id}
                                className="text-xs text-gray-700"
                              >
                                {telefono.telefono}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Sin teléfonos
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-sm">
                        {cliente.correos && cliente.correos.length > 0 ? (
                          <div className="space-y-1">
                            {cliente.correos.map((correo) => (
                              <div
                                key={correo.id}
                                className="text-xs text-gray-700 break-all"
                              >
                                {correo.correo}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">
                            Sin correos
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(cliente)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(cliente.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
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
                    }
                  );
                } else {
                  createCliente.mutate(data, {
                    onSuccess: handleCreateSuccess,
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
      </div>
    </div>
  );
}
