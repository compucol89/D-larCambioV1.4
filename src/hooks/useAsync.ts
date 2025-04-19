import { useState, useCallback } from 'react';

/**
 * Estado de una operación asíncrona
 */
export type AsyncState<T> = {
  /** Datos resultantes de la operación */
  data: T | null;
  /** Si la operación está en curso */
  loading: boolean;
  /** Mensaje de error si la operación falló */
  error: string | null;
  /** Timestamp de la última actualización exitosa */
  lastUpdated: Date | null;
};

/**
 * Hook genérico para manejar operaciones asíncronas
 * @param asyncFunction - Función asíncrona a ejecutar
 * @param initialData - Datos iniciales (opcional)
 */
export function useAsync<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  initialData: T | null = null
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastUpdated: initialData ? new Date() : null
  });

  // Función para ejecutar la operación asíncrona
  const execute = useCallback(async (...args: any[]) => {
    // Iniciar la operación
    setState(prevState => ({
      ...prevState,
      loading: true,
      error: null
    }));

    try {
      // Ejecutar la función asíncrona
      const data = await asyncFunction(...args);
      
      // Actualizar estado con el resultado exitoso
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      return { data, error: null };
    } catch (e) {
      // Capturar y formatear el error
      const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
      console.error('Error en operación asíncrona:', errorMessage);
      
      // Actualizar estado con el error
      setState(prevState => ({
        ...prevState,
        loading: false,
        error: errorMessage
      }));
      
      return { data: null, error: errorMessage };
    }
  }, [asyncFunction]);

  // Función para reiniciar el estado
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      lastUpdated: initialData ? new Date() : null
    });
  }, [initialData]);

  // Función para actualizar manualmente los datos
  const setData = useCallback((data: T) => {
    setState({
      data,
      loading: false,
      error: null,
      lastUpdated: new Date()
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData
  };
}
