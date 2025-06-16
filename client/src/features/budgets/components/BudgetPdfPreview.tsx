import { SYSTEM_CONSTANTS } from "@shared/prisma-schema";

interface BudgetPdfPreviewProps {
  budget: any;
  items: any[];
}

export default function BudgetPdfPreview({ budget, items }: BudgetPdfPreviewProps) {
  // Group items by service type and subarea
  const groupedItems = items.reduce((acc: any, item) => {
    if (!acc[item.serviceType]) {
      acc[item.serviceType] = {};
    }
    if (!acc[item.serviceType][item.subarea]) {
      acc[item.serviceType][item.subarea] = [];
    }
    acc[item.serviceType][item.subarea].push(item);
    return acc;
  }, {});

  // Calculate subtotals by service type
  const subtotalsByType = Object.entries(groupedItems).reduce((acc: any, [type, subareas]: [string, any]) => {
    acc[type] = Object.values(subareas).flat().reduce((sum: number, item: any) => sum + item.totalPrice, 0);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">{SYSTEM_CONSTANTS.COMPANY_INFO.name}</h1>
        <h2 className="text-xl font-semibold">HOJA DE ESTIMACIÓN</h2>
        <p className="text-sm text-gray-600">Código: {budget.budgetCode}</p>
      </div>

      {/* Client and Project Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-2">Información del Cliente</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Cliente:</strong> {budget.clientName}</p>
            <p><strong>Contacto:</strong> {budget.clientContact}</p>
            <p><strong>Teléfono:</strong> {budget.clientPhone}</p>
            <p><strong>Email:</strong> {budget.clientEmail}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Información del Proyecto</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Proyecto:</strong> {budget.projectName}</p>
            <p><strong>Ubicación:</strong> {budget.location}</p>
            <p><strong>Fecha:</strong> {new Date(budget.requestDate).toLocaleDateString()}</p>
            <p><strong>Responsable:</strong> {budget.projectResponsible}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">No.</th>
              <th className="py-2 px-4 text-left">Concepto</th>
              <th className="py-2 px-4 text-center">Unidad</th>
              <th className="py-2 px-4 text-right">Cantidad</th>
              <th className="py-2 px-4 text-right">P.U.</th>
              <th className="py-2 px-4 text-right">Importe</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedItems).map(([type, subareas]: [string, any]) => (
              <>
                <tr key={type}>
                  <td colSpan={6} className="py-2 px-4 font-semibold bg-gray-50">
                    {type}
                  </td>
                </tr>
                {Object.entries(subareas).map(([subarea, items]: [string, any]) => (
                  <>
                    <tr key={`${type}-${subarea}`}>
                      <td colSpan={6} className="py-1 px-4 text-sm italic bg-gray-50">
                        {subarea}
                      </td>
                    </tr>
                    {items.map((item: any, index: number) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2 px-4">{index + 1}</td>
                        <td className="py-2 px-4">{item.description}</td>
                        <td className="py-2 px-4 text-center">{item.unit}</td>
                        <td className="py-2 px-4 text-right">{item.quantity}</td>
                        <td className="py-2 px-4 text-right">
                          ${item.unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-4 text-right">
                          ${item.totalPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary by Service Type */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Resumen por Área</h3>
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(subtotalsByType).map(([type, subtotal]: [string, any]) => (
              <tr key={type} className="border-b">
                <td className="py-2 px-4">{type}</td>
                <td className="py-2 px-4 text-right">
                  ${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${budget.subtotalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA ({(SYSTEM_CONSTANTS.IVA_RATE * 100).toFixed(0)}%):</span>
            <span>${budget.ivaAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>${budget.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Forma de Pago</h3>
        <p className="text-sm">{budget.paymentMethod}</p>
      </div>

      {/* Terms and Conditions */}
      <div className="mb-8 text-xs">
        <h3 className="font-semibold mb-2">Términos y Condiciones</h3>
        <ol className="list-decimal list-inside space-y-1">
          {SYSTEM_CONSTANTS.TERMS_AND_CONDITIONS.map((term, index) => (
            <li key={index}>{term}</li>
          ))}
        </ol>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-16">
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2">
            <p className="font-semibold">{SYSTEM_CONSTANTS.COMPANY_INFO.manager}</p>
            <p className="text-sm">{SYSTEM_CONSTANTS.COMPANY_INFO.position}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-400 pt-2">
            <p className="font-semibold">Cliente</p>
            <p className="text-sm">Nombre y Firma</p>
          </div>
        </div>
      </div>
    </div>
  );
}