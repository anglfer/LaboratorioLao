import { 
  ConceptoJerarquico, 
  ConceptoJerarquicoForm, 
  FiltrosConceptos
} from '../types/conceptoJerarquico';

// ===========================================================================
// SERVICIO PARA CONCEPTOS JERÁRQUICOS (SIN PORCENTAJES)
// ===========================================================================

const API_BASE = '/api/conceptos-jerarquicos';

class ConceptosJerarquicosService {
  
  // Crear un nuevo concepto
  async crear(data: ConceptoJerarquicoForm): Promise<ConceptoJerarquico> {
    try {
      // Verificar que la conversión sea válida
      const precioConvertido = parseFloat(data.precioUnitario);
      if (isNaN(precioConvertido)) {
        throw new Error(`Precio unitario inválido: "${data.precioUnitario}"`);
      }

      // Convertir precioUnitario de string a number y areaId a string antes de enviar al backend
      const dataParaEnviar = {
        ...data,
        precioUnitario: precioConvertido,
        areaId: data.areaId.toString()
      };

      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataParaEnviar),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear concepto');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en crear concepto:', error);
      throw error;
    }
  }

  // Obtener lista de conceptos con filtros
  async obtenerLista(filtros?: FiltrosConceptos): Promise<ConceptoJerarquico[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.areaId) {
        params.append('areaId', filtros.areaId.toString());
      }

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener lista de conceptos');
      }

      const result = await response.json();
      let conceptos = result.data;
      
      // Filtrar por búsqueda si se proporciona
      if (filtros?.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        conceptos = conceptos.filter((concepto: ConceptoJerarquico) => 
          concepto.descripcion.toLowerCase().includes(busqueda) ||
          concepto.codigo.toLowerCase().includes(busqueda) ||
          concepto.unidad.toLowerCase().includes(busqueda)
        );
      }
      
      return conceptos;
    } catch (error) {
      console.error('Error en obtener lista:', error);
      throw error;
    }
  }

  // Obtener concepto por ID
  async obtenerPorId(id: number): Promise<ConceptoJerarquico> {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener concepto');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en obtener concepto por ID:', error);
      throw error;
    }
  }

  // Actualizar concepto
  async actualizar(id: number, data: ConceptoJerarquicoForm): Promise<ConceptoJerarquico> {
    try {
      // Convertir precioUnitario de string a number y areaId a string antes de enviar al backend
      const dataParaEnviar = {
        ...data,
        precioUnitario: parseFloat(data.precioUnitario),
        areaId: data.areaId.toString()
      };

      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataParaEnviar),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar concepto');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en actualizar concepto:', error);
      throw error;
    }
  }

  // Eliminar concepto
  async eliminar(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar concepto');
      }
    } catch (error) {
      console.error('Error en eliminar concepto:', error);
      throw error;
    }
  }

  // Obtener conceptos de un área específica
  async obtenerPorArea(areaId: number): Promise<ConceptoJerarquico[]> {
    return this.obtenerLista({ areaId });
  }

  // Validar si un código ya existe
  async validarCodigo(codigo: string, excludeId?: number): Promise<boolean> {
    try {
      const conceptos = await this.obtenerLista();
      return !conceptos.some(concepto => concepto.codigo === codigo && concepto.id !== excludeId);
    } catch (error) {
      console.error('Error al validar código:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio
export const conceptosJerarquicosService = new ConceptosJerarquicosService();

// Exportación por defecto
export default conceptosJerarquicosService;
