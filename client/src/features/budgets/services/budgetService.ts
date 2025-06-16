// Budget API services
export const budgetService = {
  async getAll() {
    const response = await fetch('/api/presupuestos');
    if (!response.ok) throw new Error('Failed to fetch presupuestos');
    return response.json();
  },

  async getById(id: number) {
    const response = await fetch(`/api/presupuestos/${id}`);
    if (!response.ok) throw new Error('Presupuesto not found');
    return response.json();
  },

  async create(data: any) {
    const response = await fetch('/api/presupuestos', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to create presupuesto');
    return response.json();
  },

  async update(id: number, data: any) {
    const response = await fetch(`/api/presupuestos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Failed to update presupuesto');
    return response.json();
  },

  async delete(id: number) {
    const response = await fetch(`/api/presupuestos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete presupuesto');
  },

  async generatePdf(id: number) {
    const response = await fetch(`/api/presupuestos/${id}/pdf`);
    if (!response.ok) throw new Error('Failed to generate PDF');
    return response.blob();
  },

  async getItems(id: number) {
    const response = await fetch(`/api/budgets/${id}/items`);
    if (!response.ok) throw new Error('Failed to fetch budget items');
    return response.json();
  }
};
