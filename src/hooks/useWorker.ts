import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Interfaz para el estado del worker
 */
interface WorkerState<T> {
  result: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Hook personalizado para gestionar la comunicación con Web Workers
 * @param workerPath Ruta al archivo JavaScript del worker
 */
export function useWorker<T>(workerPath: string) {
  const [state, setState] = useState<WorkerState<T>>({
    result: null,
    error: null,
    loading: false
  });
  
  // Almacenar el worker en una ref para mantenerlo entre renderizados
  const workerRef = useRef<Worker | null>(null);
  
  // Contador para identificar solicitudes
  const requestIdCounter = useRef<number>(0);
  
  // Mapa de callbacks pendientes por ID
  const pendingRequests = useRef<Map<number, (result: T) => void>>(new Map());
  
  // Inicializar el worker
  useEffect(() => {
    try {
      // Crear el worker solo en el cliente
      if (typeof window !== 'undefined') {
        workerRef.current = new Worker(workerPath);
        
        // Configurar el manejador de mensajes
        workerRef.current.onmessage = (e) => {
          const { type, requestId, data, error } = e.data;
          
          if (type === 'result') {
            // Si hay un callback pendiente para este ID, invocarlo
            if (requestId && pendingRequests.current.has(requestId)) {
              const callback = pendingRequests.current.get(requestId);
              if (callback) callback(data);
              pendingRequests.current.delete(requestId);
            }
            
            setState({
              result: data,
              error: null,
              loading: false
            });
          } else if (type === 'error') {
            // Manejar errores
            setState({
              result: null,
              error: error || 'Error desconocido en el worker',
              loading: false
            });
            
            // Limpiar cualquier callback pendiente para esta solicitud
            if (requestId) {
              pendingRequests.current.delete(requestId);
            }
          }
        };
        
        // Manejar errores
        workerRef.current.onerror = (error) => {
          console.error('Error en el Web Worker:', error);
          setState({
            result: null,
            error: error.message || 'Error desconocido en el worker',
            loading: false
          });
        };
      }
    } catch (error) {
      console.error('Error al inicializar el Web Worker:', error);
      setState({
        result: null,
        error: error instanceof Error ? error.message : 'Error desconocido',
        loading: false
      });
    }
    
    // Limpiar al desmontar
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      pendingRequests.current.clear();
    };
  }, [workerPath]);
  
  /**
   * Envía un mensaje al worker para realizar un cálculo
   */
  const calculateRates = useCallback((data: any, callback?: (result: T) => void): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        const error = 'Web Worker no está disponible';
        setState(prev => ({ ...prev, error, loading: false }));
        reject(new Error(error));
        return;
      }
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Asignar un ID único a esta solicitud
      const requestId = ++requestIdCounter.current;
      
      // Función para resolver la promesa y ejecutar el callback
      const handleResult = (result: T) => {
        resolve(result);
        if (callback) callback(result);
      };
      
      // Guardar el callback para cuando llegue la respuesta
      if (callback || true) { // Siempre almacenar para resolver la promesa
        pendingRequests.current.set(requestId, handleResult);
      }
      
      // Enviar el mensaje al worker
      workerRef.current.postMessage({
        type: 'calculateRates',
        data: { ...data, requestId }
      });
    });
  }, []);
  
  return {
    ...state,
    calculateRates
  };
}
