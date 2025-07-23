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

export default function ClientesPage() {
  const { data: clientes, isLoading, error } = useClientes();
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();
  const deleteCliente = useDeleteCliente();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);

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

  const handleCreateSuccess = () => {
    setShowForm(false);
    setEditing(null);
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
              <Button
                onClick={() => exportToCSV(filteredClientes)}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" /> Exportar
              </Button>
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
      </div>
    </div>
  );
}
