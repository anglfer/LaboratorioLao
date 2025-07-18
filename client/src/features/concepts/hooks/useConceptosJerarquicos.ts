import { useState, useCallback } from 'react';
import { 
  AreaJerarquica, 
  ConceptoJerarquico, 
  AreaJerarquicaForm, 
  ConceptoJerarquicoForm 
} from '../types/conceptoJerarquico';
import { areasJerarquicasService } from '../services/areasJerarquicasService';
import { conceptosJerarquicosService } from '../services/conceptosJerarquicosService';

// Hook para manejar áreas jerárquicas
export const useAreas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (data: AreaJerarquicaForm): Promise<AreaJerarquica | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await areasJerarquicasService.crear(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear área';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizar = useCallback(async (id: number, data: AreaJerarquicaForm): Promise<AreaJerarquica | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await areasJerarquicasService.actualizar(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar área';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminar = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await areasJerarquicasService.eliminar(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar área';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    crear,
    actualizar,
    eliminar,
    loading,
    error
  };
};

// Hook para manejar conceptos jerárquicos
export const useConceptos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = useCallback(async (data: ConceptoJerarquicoForm): Promise<ConceptoJerarquico | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await conceptosJerarquicosService.crear(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear concepto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizar = useCallback(async (id: number, data: ConceptoJerarquicoForm): Promise<ConceptoJerarquico | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await conceptosJerarquicosService.actualizar(id, data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar concepto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const eliminar = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await conceptosJerarquicosService.eliminar(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar concepto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    crear,
    actualizar,
    eliminar,
    loading,
    error
  };
};
