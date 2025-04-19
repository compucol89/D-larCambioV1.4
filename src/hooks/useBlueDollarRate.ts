import { useState, useEffect, useRef } from 'react';
import { fetchWithRetry, fetchWithCacheAndRetry } from '../services/utils';

// Tiempo de actualización: 30 minutos (más largo que el intervalo general)
const BLUE_DOLLAR_UPDATE_INTERVAL = 1800000;

// Caché global para compartir el valor entre componentes
// Fuera del hook para que persista entre renderizados
let globalBlueDollarCache: {
  venta: number | null;
  lastUpdate: number;
  isLoading: boolean;
  error: string | null;
} = {
  venta: null,
  lastUpdate: 0,
  isLoading: false,
  error: null
};

/**
 * Hook personalizado para obtener y almacenar en caché la tasa del dólar blue
 * Garantiza una única fuente de datos compartida entre todos los componentes
 */
export function useBlueDollarRate() {
  const [blueDollarVenta, setBlueDollarVenta] = useState<number | null>(globalBlueDollarCache.venta);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(globalBlueDollarCache.error);
  const abortControllerRef = useRef<AbortController | null>(null);

  const shouldFetch = (): boolean => {
    const now = Date.now();
    // Actualizar si no hay datos, o si han pasado más de 30 minutos desde la última actualización
    return !globalBlueDollarCache.venta || (now - globalBlueDollarCache.lastUpdate > BLUE_DOLLAR_UPDATE_INTERVAL);
  };

  const fetchBlueDollar = async () => {
    // Si ya hay una solicitud en curso, no iniciar otra
    if (globalBlueDollarCache.isLoading) return;

    try {
      setIsLoading(true);
      globalBlueDollarCache.isLoading = true;
      
      // Crear un nuevo AbortController para esta solicitud
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;
      
      // Usar fetchWithCacheAndRetry con un tiempo de caché de 10 minutos
      // Menor que el intervalo de actualización para permitir actualizaciones manuales
      const response = await fetchWithCacheAndRetry(
        'https://dolarapi.com/v1/dolares/blue', 
        600000, // 10 minutos de caché
        3, 
        signal
      );
      
      // Comprobar si la respuesta indica que fue abortada
      if (response.status === 499) {
        console.log('Blue dollar fetch was aborted, using cached data if available');
        setIsLoading(false);
        globalBlueDollarCache.isLoading = false;
        return;
      }
      
      if (!response.ok) throw new Error('Error al obtener datos del dólar blue');
      
      const data = await response.json();
      
      // Actualizar caché global
      globalBlueDollarCache = {
        venta: data.venta,
        lastUpdate: Date.now(),
        isLoading: false,
        error: null
      };
      
      // Actualizar estado local
      setBlueDollarVenta(data.venta);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Solo actualizar el estado de error si no fue un error de aborto
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching blue dollar rate:', error);
        globalBlueDollarCache.error = errorMessage;
        setError(globalBlueDollarCache.error);
      } else {
        console.log('Blue dollar fetch was aborted');
      }
      
      globalBlueDollarCache.isLoading = false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Si necesitamos actualizar los datos
    if (shouldFetch()) {
      fetchBlueDollar();
    } else if (globalBlueDollarCache.venta !== blueDollarVenta) {
      // Sincronizar con la caché global si hay diferencias
      setBlueDollarVenta(globalBlueDollarCache.venta);
    }
    
    // Configurar actualizaciones periódicas
    const interval = setInterval(() => {
      if (shouldFetch()) {
        fetchBlueDollar();
      }
    }, BLUE_DOLLAR_UPDATE_INTERVAL);
    
    // Limpiar al desmontar el componente
    return () => {
      clearInterval(interval);
      
      // Abortar cualquier solicitud pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { blueDollarVenta, isLoading, error };
}
