import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "../../../shared/components/ui/button";
import { SYSTEM_CONSTANTS } from "@shared/prisma-schema";

export default function BudgetPrint() {
  const [match, params] = useRoute("/budgets/:id/print");
  const id = params?.id;
  const [budget, setBudget] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBudget() {
      setLoading(true);
      const res = await fetch(`/api/budgets/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setBudget(data);
      // fetch items
      const itemsRes = await fetch(`/api/budgets/${id}/items`);
      if (itemsRes.ok) {
        setItems(await itemsRes.json());
      }
      setLoading(false);
    }
    if (id) fetchBudget();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (!budget) return <div className="p-8 text-center">Presupuesto no encontrado</div>;

  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice || 0), 0);
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 print:p-0 print:bg-white">
      {/* Imagen superior (logo o encabezado) */}
      <div className="w-full flex justify-center mb-4">
        {/* Reemplaza la ruta de la imagen cuando la tengas */}
        <div style={{ width: 180, height: 80, background: '#f3f3f3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="text-gray-400">[Imagen aquí]</span>
        </div>
      </div>
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Button variant="outline" onClick={() => window.history.back()}>Volver</Button>
        <Button onClick={() => window.print()} className="bg-green-600 text-white">Imprimir</Button>
      </div>
      {/* Encabezado simplificado */}
      <div className="border-b pb-4 mb-6 text-center">
        <div className="text-3xl font-bold mt-2">Presupuesto</div>
        <div className="text-lg font-bold text-gray-800 mt-2">Clave de Obra: <span className="text-green-700">{budget.budgetCode}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div><b>Cliente:</b> {budget.clientName}</div>
          <div><b>Contacto:</b> {budget.clientContact || '-'}</div>
          <div><b>Teléfono:</b> {budget.clientPhone || '-'}</div>
          <div><b>Correo:</b> {budget.clientEmail || '-'}</div>
          <div><b>Descripción del Proyecto:</b> {budget.projectDescription || '-'}</div>
          <div><b>Ubicación del Proyecto:</b> {budget.projectLocation || '-'}</div>
          <div><b>Ubicación:</b> {budget.location || '-'}</div>
        </div>
        <div>
          <div><b>Fecha de Solicitud:</b> {budget.requestDate ? new Date(budget.requestDate).toLocaleDateString('es-MX') : '-'}</div>
          <div><b>Fecha de Estimación:</b> {budget.estimationDate ? new Date(budget.estimationDate).toLocaleDateString('es-MX') : (budget.createdAt ? new Date(budget.createdAt).toLocaleDateString('es-MX') : '-')}</div>
          <div><b>Estado:</b> {budget.status === 'draft' ? 'Borrador' : budget.status === 'pending' ? 'Pendiente' : budget.status === 'approved' ? 'Aprobado' : budget.status}</div>
        </div>
      </div>
      <table className="w-full border mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">No.</th>
            <th className="border px-2 py-1">Descripción</th>
            <th className="border px-2 py-1">Unidad</th>
            <th className="border px-2 py-1">Cantidad</th>
            <th className="border px-2 py-1">P.U.</th>
            <th className="border px-2 py-1">Importe</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-gray-400 py-8">No hay conceptos guardados para este presupuesto.</td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr key={item.id} className={(!item.description || !item.unit || !item.quantity || !item.unitPrice || !item.totalPrice) ? 'bg-red-50' : ''}>
                <td className="border px-2 py-1 text-center">{(idx + 1).toString().padStart(2, '0')}</td>
                <td className="border px-2 py-1">{item.description || <span className="text-red-500">(Sin descripción)</span>}</td>
                <td className="border px-2 py-1 text-center">{item.unit || <span className="text-red-500">-</span>}</td>
                <td className="border px-2 py-1 text-right">{item.quantity ? parseFloat(item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : <span className="text-red-500">-</span>}</td>
                <td className="border px-2 py-1 text-right">{item.unitPrice ? `$${parseFloat(item.unitPrice).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : <span className="text-red-500">-</span>}</td>
                <td className="border px-2 py-1 text-right">{item.totalPrice ? `$${parseFloat(item.totalPrice).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : <span className="text-red-500">-</span>}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="text-right mb-8">
        <div><b>Subtotal:</b> ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
        <div><b>IVA (16%):</b> ${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
        <div className="text-lg font-bold"><b>Total:</b> ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
      </div>
      <div className="mb-8">
        <div className="font-bold mb-2">Términos y Condiciones</div>
        <ul className="list-disc pl-6 text-sm">
          {SYSTEM_CONSTANTS.TERMS_AND_CONDITIONS.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
      {/* Pie de página limpio, sin datos de empresa ni sistema */}
    </div>
  );
}
