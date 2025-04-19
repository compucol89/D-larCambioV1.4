import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchWithRetry, fetchWithCacheAndRetry } from '../services/utils';
import { useAsync } from './useAsync';
import { Rate } from '../types';

const UPDATE_INTERVAL = 300000; // 5 minutos

/**
 * Función utilitaria para realizar múltiples solicitudes HTTP en batch
 * utilizando un mismo AbortController para todas
 */
const batchRequests = async (
  urls: string[], 
  fetchFn: typeof fetchWithRetry | typeof fetchWithCacheAndRetry = fetchWithRetry,
  attempts: number = 3, 
  maxAge?: number,
  signal?: AbortSignal
): Promise<Response[]> => {
  // Si se proporciona maxAge, usar fetchWithCacheAndRetry, de lo contrario usar fetchWithRetry
  if (maxAge !== undefined) {
    return Promise.all(urls.map(url => 
      fetchWithCacheAndRetry(url, maxAge, attempts, signal)
    ));
  }
  return Promise.all(urls.map(url => 
    fetchWithRetry(url, attempts, signal)
  ));
};

/**
 * Hook para obtener las tasas de cambio de Latinoamérica
 * Utiliza el hook useAsync para un manejo consistente de estados
 */
export function useLatamRates() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);
  const [nextUpdate, setNextUpdate] = useState<number>(UPDATE_INTERVAL / 1000);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  
  // Cache para los últimos datos procesados
  const [cachedRatesData, setCachedRatesData] = useState<{
    paraleloPrice: number;
    remesasPrice: number | null;
    colombiaBuy: number;
    colombiaSell: number;
    colombiaValue: number;
    timestamp: string;
  } | null>(null);
  
  // Función asíncrona para obtener las tasas
  const fetchLatamRates = useCallback(async () => {
    // Abortar solicitud anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nueva instancia para esta solicitud
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      // Definir URLs para nuestras solicitudes
      const urls = [
        'https://pydolarve.org/api/v1/dollar?monitor=enparalelovzla',
        'https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde DESC',
        'https://dolarapi.com/v1/dolares/blue'
      ];
      
      // Usar fetchWithCacheAndRetry para todas las solicitudes con caché de 5 minutos
      const maxAge = 300000; // 5 minutos
      const attempts = 3;
      
      // Realizar solicitudes en batch
      const responses = await batchRequests(urls, fetchWithCacheAndRetry, attempts, maxAge, signal);
      const [venezuelaResponse, colombiaResponse, blueDollarResponse] = responses;
        
      // Verificar si la operación fue abortada durante las solicitudes
      if (signal.aborted) {
        console.log('Solicitud a Latam cancelada - componente posiblemente desmontado');
        throw new Error('Operación cancelada');
      }

      // Si alguna de las respuestas indica un aborto, detener
      if (venezuelaResponse.status === 499 ||
          colombiaResponse.status === 499 ||
          blueDollarResponse.status === 499) {
        console.log('Una de las solicitudes de Latam fue abortada');
        throw new Error('Operación cancelada');
      }

      // Intentar procesar las respuestas
      let venezuelaData, colombiaData, blueDollarData;
      
      try {
        venezuelaData = await venezuelaResponse.json();
        colombiaData = await colombiaResponse.json();
        blueDollarData = await blueDollarResponse.json();
      } catch (parseError) {
        console.error('Error al analizar respuestas JSON de Latam:', parseError);
        throw new Error('Error al procesar datos recibidos');
      }

      // Verificar datos válidos
      if (!venezuelaData?.price ||
          !colombiaData?.[0]?.valor ||
          !blueDollarData?.venta) {
        console.error('Datos incompletos de las APIs de Latam', {
          venezuelaData,
          colombiaData,
          blueDollarData
        });
        throw new Error('Datos incompletos de las APIs');
      }

      const now = new Date().toISOString();
      const paraleloPrice = venezuelaData.price;
      const remesasPrice = blueDollarData.venta
        ? paraleloPrice * 0.93 / blueDollarData.venta
        : null;
      const colombiaValue = parseFloat(colombiaData[0].valor);
      const colombiaBuy = colombiaValue * 0.97;
      const colombiaSell = colombiaValue * 1.01;

      // Actualizar el caché de datos procesados
      setCachedRatesData({
        paraleloPrice,
        remesasPrice,
        colombiaBuy,
        colombiaSell,
        colombiaValue,
        timestamp: now
      });

      setNextUpdate(UPDATE_INTERVAL / 1000);
      
      // Ya no estamos en carga inicial después de la primera carga exitosa
      setInitialLoad(false);
      
      // Crear array de rates a partir de los datos calculados
      const newRates: Rate[] = [
        {
          casa: 'venezuela',
          nombre: 'Venezuela',
          compra: paraleloPrice,
          venta: remesasPrice,
          fechaActualizacion: now,
        },
        {
          casa: 'colombia',
          nombre: 'Colombia',
          compra: colombiaBuy,
          venta: colombiaSell,
          fechaActualizacion: now,
          variacionVenta: colombiaValue,
        },
      ];
      
      return newRates;
    } catch (err) {
      // Si es un error de aborto, no propagar como error visible al usuario
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Operación cancelada')) {
        console.log('Solicitud cancelada - componente posiblemente desmontado');
        
        // Usar un patrón que useAsync reconocerá pero no mostrará al usuario
        if (initialLoad) {
          return [];  // Devolver array vacío durante la carga inicial
        }
        
        throw new Error('__ABORT__');  // Error especial que ignoraremos
      }
      
      console.error('Error al obtener tasas de Latam:', err);
      throw new Error('Error al obtener las cotizaciones. Por favor, intente nuevamente.');
    }
  }, [initialLoad]);
  
  // Personalizar el manejo de errores para ignorar ciertos códigos
  const handleError = useCallback((error: string | null) => {
    // Ignorar errores de aborto y mostrar null (sin error) al usuario
    if (error === '__ABORT__') {
      return null;
    }
    return error;
  }, []); // Sin dependencias porque la función no depende de ningún valor externo
  
  // Usar el hook useAsync para manejar estados
  const { 
    data: ratesFromAsync, 
    loading, 
    error: rawError, 
    lastUpdated: lastUpdate, 
    execute: fetchRates 
  } = useAsync<Rate[]>(fetchLatamRates, []);
  
  // Aplicar el procesamiento de errores
  const error = handleError(rawError);
  
  // Memorizar las tasas a partir de los datos en caché o los datos de useAsync
  const rates = useMemo(() => {
    if (ratesFromAsync && ratesFromAsync.length > 0) {
      return ratesFromAsync;
    } else if (cachedRatesData) {
      // Reconstruir las tasas a partir de los datos en caché
      return [
        {
          casa: 'venezuela',
          nombre: 'Venezuela',
          compra: cachedRatesData.paraleloPrice,
          venta: cachedRatesData.remesasPrice,
          fechaActualizacion: cachedRatesData.timestamp,
        },
        {
          casa: 'colombia',
          nombre: 'Colombia',
          compra: cachedRatesData.colombiaBuy,
          venta: cachedRatesData.colombiaSell,
          fechaActualizacion: cachedRatesData.timestamp,
          variacionVenta: cachedRatesData.colombiaValue,
        },
      ];
    }
    return [];
  }, [ratesFromAsync, cachedRatesData]);
  
  // Configurar actualización automática
  useEffect(() => {
    // Ejecutar la primera carga
    fetchRates();
    
    // Configurar actualizaciones periódicas
    const interval = setInterval(fetchRates, UPDATE_INTERVAL);
    
    // Limpiar al desmontar
    return () => {
      clearInterval(interval);
      
      // Abortar cualquier solicitud en curso
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Limpiar el temporizador
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchRates]);
  
  // Temporizador para la cuenta regresiva
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setNextUpdate(prev => {
        const newValue = prev - 5;
        return newValue > 0 ? newValue : UPDATE_INTERVAL / 1000;
      });
    }, 5000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return { 
    rates, 
    loading, 
    error, 
    fetchRates, 
    lastUpdate, 
    nextUpdate 
  };
}
