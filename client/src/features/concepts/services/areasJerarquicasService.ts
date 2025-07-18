import { AreaJerarquica, AreaJerarquicaForm, ArbolCompleto, FiltrosAreas } from '../types/conceptoJerarquico';

const API_BASE = '/api/areas-jerarquicas';

class AreasJerarquicasService {
  
  // Crear una nueva área
  async crear(data: AreaJerarquicaForm): Promise<AreaJerarquica> {
    try {
      // Convertir padreId a string para que coincida con el schema del backend
      const dataParaEnviar = {
        ...data,
        padreId: data.padreId ? data.padreId.toString() : undefined
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
        throw new Error(error.message || 'Error al crear área');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en crear área:', error);
      throw error;
    }
  }

  // Obtener árbol completo de áreas
  async obtenerArbol(): Promise<ArbolCompleto[]> {
    try {
      const response = await fetch(`${API_BASE}/arbol`);
      
      if (!response.ok) {
        throw new Error('Error al obtener árbol de áreas');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en obtener árbol:', error);
      throw error;
    }
  }

  // Obtener lista plana de áreas
  async obtenerLista(filtros?: FiltrosAreas): Promise<AreaJerarquica[]> {
    try {
      const params = new URLSearchParams();
      
      if (filtros?.nivel) {
        params.append('nivel', filtros.nivel.toString());
      }
      
      if (filtros?.padreId !== undefined) {
        params.append('padreId', filtros.padreId?.toString() || '');
      }

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener lista de áreas');
      }

      const result = await response.json();
      let areas = result.data;
      
      // Filtrar por búsqueda si se proporciona
      if (filtros?.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        areas = areas.filter((area: AreaJerarquica) => 
          area.nombre.toLowerCase().includes(busqueda) ||
          area.codigo.toLowerCase().includes(busqueda)
        );
      }
      
      return areas;
    } catch (error) {
      console.error('Error en obtener lista:', error);
      throw error;
    }
  }

  // Obtener área por ID
  async obtenerPorId(id: number): Promise<AreaJerarquica> {
    try {
      const response = await fetch(`${API_BASE}/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener área');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en obtener área por ID:', error);
      throw error;
    }
  }

  // Actualizar área
  async actualizar(id: number, data: AreaJerarquicaForm): Promise<AreaJerarquica> {
    try {
      // Convertir padreId a string para que coincida con el schema del backend
      const dataParaEnviar = {
        ...data,
        padreId: data.padreId ? data.padreId.toString() : undefined
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
        throw new Error(error.message || 'Error al actualizar área');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en actualizar área:', error);
      throw error;
    }
  }

  // Eliminar área
  async eliminar(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar área');
      }
    } catch (error) {
      console.error('Error en eliminar área:', error);
      throw error;
    }
  }

  // Obtener áreas hijas de un padre específico
  async obtenerHijas(padreId: number): Promise<AreaJerarquica[]> {
    return this.obtenerLista({ padreId });
  }

  // Obtener áreas de un nivel específico
  async obtenerPorNivel(nivel: number): Promise<AreaJerarquica[]> {
    return this.obtenerLista({ nivel });
  }

  // Validar si un código ya existe
  async validarCodigo(codigo: string, excludeId?: number): Promise<boolean> {
    try {
      const areas = await this.obtenerLista();
      return !areas.some(area => area.codigo === codigo && area.id !== excludeId);
    } catch (error) {
      console.error('Error al validar código:', error);
      return false;
    }
  }

  // Obtener posibles padres para un nivel específico
  async obtenerPosiblesPadres(nivel: number): Promise<AreaJerarquica[]> {
    if (nivel <= 1) {
      return [];
    }
    
    return this.obtenerPorNivel(nivel - 1);
  }

  // Obtener estructura de árbol plano para dropdowns
  async obtenerArbolPlano(): Promise<AreaJerarquica[]> {
    try {
      const response = await fetch(`${API_BASE}/plano`);
      
      if (!response.ok) {
        throw new Error('Error al obtener árbol plano');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error en obtener árbol plano:', error);
      throw error;
    }
  }
}

export const areasJerarquicasService = new AreasJerarquicasService();
