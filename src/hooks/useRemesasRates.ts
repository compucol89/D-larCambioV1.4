/// <reference types="vite/client" />

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchWithRetry, fetchWithCacheAndRetry } from '../services/utils';
import { useLatamRates } from './useLatamRates';
import { useExchangeRatesData } from './useExchangeRatesData';
import { useWorker } from './useWorker';

interface Rate {
  casa: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  fechaActualizacion: string;
  variacionCompra?: number;
  variacionVenta?: number;
}

interface RemesasRate {
  country: string;
  sendRate: number | null;
  receiveRate: number | null;
  flag: string;
}

// Interfaz para datos procesados para memorización
interface ProcessedRatesData {
  venezuela: {
    venta: number | null;
    compra: number | null;
  };
  dolarBlue: {
    compra: number | null;
  };
  marketRates: {
    colombia: { bid: number; ask: number };
    peru: { bid: number; ask: number };
    brasil: { bid: number; ask: number };
    chile: { bid: number; ask: number };
    argentina: { bid: number };
    ecuador: { bid: number; ask: number };
    paraguay: { bid: number; ask: number };
    bolivia: { bid: number; ask: number };
    mexico: { bid: number; ask: number };
    uruguay: { bid: number; ask: number };
  } | null;
}

const UPDATE_INTERVAL = 300000;
const SPREAD = 0.05;

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

export function useRemesasRates() {
  const [rates, setRates] = useState<RemesasRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [nextUpdate, setNextUpdate] = useState<number>(UPDATE_INTERVAL / 1000);
  const { rates: latamRates, error: latamError } = useLatamRates();
  const { rates: exchangeRates, loading: exchangeRatesLoading } = useExchangeRatesData();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Inicializar Web Worker para cálculos
  const { calculateRates, error: workerError } = useWorker<{
    sendRates: Record<string, number | null>;
    receiveRates: Record<string, number | null>;
  }>('/workers/calcWorker.js');
  
  // Cachear datos procesados para usarse en memorización
  const [processedRatesData, setProcessedRatesData] = useState<ProcessedRatesData | null>(null);

  // Ya no necesitamos memorizar estos cálculos, ahora los hace el worker
  // Solo mantenemos las referencias a las funciones para compatibilidad
  const calculationFunctions = useMemo(() => {
    return {
      calculateColombiaSendRate: (valor_compra_usdt_colombia: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_colombia * (1 - 0.033)) / valor_dolar_blue_venta_argentina;
      },
      
      calculatePeruSendRate: (valor_compra_usdt_peru: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_peru * (1 - 0.033)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateBrasilSendRate: (valor_compra_usdt_brasil: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_brasil * (1 - 0.03)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateChileSendRate: (valor_compra_usdt_chile: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_chile * (1 - 0.031)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateEcuadorSendRate: (valor_compra_usdt_ecuador: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_ecuador * (1 - 0.031)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateParaguaySendRate: (valor_compra_usdt_paraguay: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_paraguay * (1 - 0.033)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateBoliviaSendRate: (valor_compra_usdt_bolivia: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_bolivia * (1 - 0.033)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateUruguaySendRate: (valor_compra_usdt_uruguay: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_uruguay * (1 - 0.033)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateMexicoSendRate: (valor_compra_usdt_mexico: number, valor_dolar_blue_venta_argentina: number | null): number | null => {
        if (valor_dolar_blue_venta_argentina === null) return null;
        return (valor_compra_usdt_mexico * (1 - 0.033)) / valor_dolar_blue_venta_argentina;
      },
      
      calculateSendRate: (arsToUsdRate: number, usdToTargetRate: number): number => {
        return arsToUsdRate * usdToTargetRate * (1 - SPREAD);
      },
      
      calculateReceiveRate: (usdToArsRate: number, targetToUsdRate: number | null): number | null => {
        if (targetToUsdRate === null) return null;
        return usdToArsRate * targetToUsdRate * (1 - SPREAD);
      }
    };
  }, []);

  const fetchRates = useCallback(async () => {
    // Abortar cualquier solicitud anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear nueva instancia para esta solicitud
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      setLoading(true);
      setError(null);

      const remesasApiUrl = import.meta.env.VITE_REMESAS_API_URL;
      console.log("VITE_REMESAS_API_URL:", remesasApiUrl);

      const venezuelaRate = latamRates.find(
        (rate) => rate.casa === 'venezuela'
      );
      const dolarBlueRate = exchangeRates.find((rate) => rate.casa === 'blue');

      // Check if required rates are available before making API calls
      if (!venezuelaRate || venezuelaRate.compra === null || venezuelaRate.venta === null) {
        throw new Error("Venezuelan exchange rate data is missing or incomplete.");
      }
      
      if (!dolarBlueRate || dolarBlueRate.compra === null) {
        throw new Error("Dólar Blue exchange rate data is missing or incomplete.");
      }

      // Verificar si se abortó antes de continuar
      if (signal.aborted) {
        return;
      }

      // Definir el tiempo de caché de 10 minutos para estas APIs de tipo de cambio
      const cacheTime = 600000;
      const attempts = 3;
      
      // Definir todas las URLs para las solicitudes en batch
      const urls = [
        `${remesasApiUrl}/USDT/COP/0.1`,
        `${remesasApiUrl}/USDT/PEN/0.1`,
        `${remesasApiUrl}/USDT/BRL/0.1`,
        `${remesasApiUrl}/USDT/CLP/0.1`,
        `${remesasApiUrl}/USDT/ARS/0.1`,
        `${remesasApiUrl}/USDT/USD/0.1`,
        `${remesasApiUrl}/USDT/PYG/0.1`,
        `${remesasApiUrl}/USDT/BOB/0.1`,
        `${remesasApiUrl}/USDT/MXN/0.1`,
        `${remesasApiUrl}/USDT/UYU/0.1`,
      ];
      
      // Realizar todas las solicitudes en un solo batch con el mismo AbortController
      const responses = await batchRequests(urls, fetchWithCacheAndRetry, attempts, cacheTime, signal);
      
      // Verificar nuevamente si se abortó después de las llamadas
      if (signal.aborted) {
        return;
      }
      
      // Extraer las respuestas individuales del array de resultados
      const [
        colombiaResponse,
        peruResponse,
        brasilResponse,
        chileResponse,
        argentinaResponse,
        ecuadorResponse,
        paraguayResponse,
        boliviaResponse,
        mexicoResponse,
        uruguayResponse,
      ] = responses;
      
      // Verificar si alguna respuesta indica un aborto
      if (responses.some(response => response.status === 499)) {
        console.log('Una de las solicitudes de remesas fue abortada');
        return;
      }
      
      // Procesar los datos JSON de cada respuesta
      const [
        colombia,
        peru,
        brasil,
        chile,
        argentina,
        ecuador,
        paraguay,
        bolivia,
        mexico,
        uruguay,
      ] = await Promise.all([
        colombiaResponse.json(),
        peruResponse.json(),
        brasilResponse.json(),
        chileResponse.json(),
        argentinaResponse.json(),
        ecuadorResponse.json(),
        paraguayResponse.json(),
        boliviaResponse.json(),
        mexicoResponse.json(),
        uruguayResponse.json(),
      ]);
      
      // Preparar datos para el worker
      const marketRates = {
        venezuela: {
          compra: venezuelaRate.compra,
          venta: venezuelaRate.venta
        },
        colombia: { bid: colombia.bid, ask: colombia.ask },
        peru: { bid: peru.bid, ask: peru.ask },
        brasil: { bid: brasil.bid, ask: brasil.ask },
        chile: { bid: chile.bid, ask: chile.ask },
        argentina: { bid: argentina.bid },
        ecuador: { bid: ecuador.bid, ask: ecuador.ask },
        paraguay: { bid: paraguay.bid, ask: paraguay.ask },
        bolivia: { bid: bolivia.bid, ask: bolivia.ask },
        mexico: { bid: mexico.bid, ask: mexico.ask },
        uruguay: { bid: uruguay.bid, ask: uruguay.ask }
      };
      
      // Guardar datos procesados para memorización
      setProcessedRatesData({
        venezuela: {
          compra: venezuelaRate.compra,
          venta: venezuelaRate.venta
        },
        dolarBlue: {
          compra: dolarBlueRate.compra
        },
        marketRates
      });
      
      // Usar Web Worker para realizar los cálculos intensivos
      const workerData = {
        calculationType: 'remesasRates',
        dolarBlueCompra: dolarBlueRate.compra,
        argentinaBid: argentina.bid,
        marketRates
      };
      
      try {
        // Enviar datos al worker y esperar resultados
        const workerResults = await calculateRates(workerData);
        
        // Transformar resultados del worker al formato esperado por la UI
        const remesasRates = [
          {
            country: 'Venezuela',
            sendRate: venezuelaRate.venta,
            receiveRate: workerResults.receiveRates.venezuela || null,
            flag: '/flags/venezuela.svg',
          },
          {
            country: 'Colombia',
            sendRate: workerResults.sendRates.colombia || null,
            receiveRate: workerResults.receiveRates.colombia || null,
            flag: '/flags/colombia.svg',
          },
          {
            country: 'Ecuador',
            sendRate: workerResults.sendRates.ecuador || null,
            receiveRate: workerResults.receiveRates.ecuador || null,
            flag: '/flags/ecuador.svg',
          },
          {
            country: 'Chile',
            sendRate: workerResults.sendRates.chile || null,
            receiveRate: workerResults.receiveRates.chile || null,
            flag: '/flags/chile.svg',
          },
          {
            country: 'Perú',
            sendRate: workerResults.sendRates.peru || null,
            receiveRate: workerResults.receiveRates.peru || null,
            flag: '/flags/peru.svg',
          },
          {
            country: 'Paraguay',
            sendRate: workerResults.sendRates.paraguay || null,
            receiveRate: workerResults.receiveRates.paraguay || null,
            flag: '/flags/paraguay.svg',
          },
          {
            country: 'Bolivia',
            sendRate: workerResults.sendRates.bolivia || null,
            receiveRate: workerResults.receiveRates.bolivia || null,
            flag: '/flags/bolivia.svg',
          },
          {
            country: 'Brasil',
            sendRate: workerResults.sendRates.brasil || null,
            receiveRate: workerResults.receiveRates.brasil || null,
            flag: '/flags/brasil.svg',
          },
          {
            country: 'Uruguay',
            sendRate: workerResults.sendRates.uruguay || null,
            receiveRate: workerResults.receiveRates.uruguay || null,
            flag: '/flags/uruguay.svg',
          },
          {
            country: 'México',
            sendRate: workerResults.sendRates.mexico || null,
            receiveRate: workerResults.receiveRates.mexico || null,
            flag: '/flags/mexico.svg',
          },
          {
            country: 'PayPal',
            sendRate: workerResults.sendRates.paypal || null,
            receiveRate: 0,
            flag: '/flags/paypal.svg',
          },
          {
            country: 'Zelle',
            sendRate: workerResults.sendRates.zelle || null,
            receiveRate: 0,
            flag: '/flags/zelle.svg',
          },
        ];
        
        // Actualizar estado con los resultados calculados
        setRates(remesasRates);
      } catch (workerErr) {
        console.error('Error en cálculos del worker:', workerErr);
        // Si falla el worker, usar el método de procesamiento anterior
        fallbackToTraditionalCalculation();
      }

      // Solo actualizar el estado si no se ha abortado
      if (!signal.aborted) {
        setLastUpdate(new Date());
        setNextUpdate(UPDATE_INTERVAL / 1000);
        setLoading(false);
      }
    } catch (err) {
      // Solo actualizar el estado de error si no fue un error de aborto
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        console.error('Error fetching remesa rates:', err);
        setError(
          'Error al obtener las cotizaciones de remesas. Por favor, intente nuevamente.'
        );
      } else {
        console.log('Remesas rates fetch was aborted');
      }
      
      // Actualizar estado de carga si no se abortó
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [latamRates, exchangeRates, calculateRates]);

  // Función de fallback para calcular tasas si el worker falla
  const fallbackToTraditionalCalculation = useCallback(() => {
    if (!processedRatesData || !processedRatesData.marketRates) {
      return;
    }
    
    const {
      venezuela,
      dolarBlue,
      marketRates
    } = processedRatesData;
    
    const traditionalRates = [
      {
        country: 'Venezuela',
        sendRate: venezuela.venta,
        receiveRate: calculationFunctions.calculateReceiveRate(
          marketRates.argentina.bid, 
          venezuela.compra
        ),
        flag: '/flags/venezuela.svg',
      },
      {
        country: 'Colombia',
        sendRate: calculationFunctions.calculateColombiaSendRate(
          marketRates.colombia.bid,
          dolarBlue.compra
        ),
        receiveRate: calculationFunctions.calculateReceiveRate(
          marketRates.argentina.bid, 
          marketRates.colombia.ask
        ),
        flag: '/flags/colombia.svg',
      },
      // ... similar pattern for other countries
    ];
    
    // Si hay al menos algunos datos válidos, actualizar las tasas
    if (traditionalRates.length > 0) {
      setRates(traditionalRates);
    }
  }, [processedRatesData, calculationFunctions.calculateReceiveRate, calculationFunctions.calculateColombiaSendRate]);

  // Manejar errores del worker
  useEffect(() => {
    if (workerError) {
      console.error('Error en Web Worker:', workerError);
      // Si hay un error en el worker y tenemos datos procesados, usar el método tradicional
      if (processedRatesData) {
        fallbackToTraditionalCalculation();
      }
    }
  }, [workerError, processedRatesData, fallbackToTraditionalCalculation]);

  // Actualizar el estado rates cuando se actualizan los datos memorizados
  useEffect(() => {
    if (rates.length > 0) {
      setRates(rates);
    }
  }, [rates]);

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, UPDATE_INTERVAL);
    
    // Limpiar al desmontar
    return () => {
      clearInterval(interval);
      
      // Abortar cualquier solicitud pendiente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchRates]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextUpdate((prev) => {
        const newValue = prev - 5;
        return newValue > 0 ? newValue : UPDATE_INTERVAL / 1000;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return { rates, loading, error, fetchRates, lastUpdate, nextUpdate };
}
