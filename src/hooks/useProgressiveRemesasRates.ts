import { useCallback, useMemo } from 'react';
import { useStagedDataLoading } from './useStagedDataLoading';
import { useLatamRates } from './useLatamRates';
import { useExchangeRatesData } from './useExchangeRatesData';
import { useWorker } from './useWorker';
import { fetchWithCacheAndRetry } from '../services/utils';

interface RemesasRate {
  country: string;
  sendRate: number | null;
  receiveRate: number | null;
  flag: string;
}

interface CriticalData {
  countries: {
    venezuela: { compra: number | null; venta: number | null };
    colombia: { bid: number; ask: number };
    peru: { bid: number; ask: number };
    argentina: { bid: number };
    ecuador: { bid: number; ask: number };
  };
  dolarBlueCompra: number | null;
  criticalRates: RemesasRate[];
}

interface SecondaryData {
  countries: {
    brasil: { bid: number; ask: number };
    chile: { bid: number; ask: number };
    paraguay: { bid: number; ask: number };
    bolivia: { bid: number; ask: number };
    mexico: { bid: number; ask: number };
    uruguay: { bid: number; ask: number };
  };
  secondaryRates: RemesasRate[];
}

interface CombinedData {
  rates: RemesasRate[];
  allMarketRates: {
    venezuela: { compra: number | null; venta: number | null };
    colombia: { bid: number; ask: number };
    peru: { bid: number; ask: number };
    argentina: { bid: number };
    ecuador: { bid: number; ask: number };
    brasil: { bid: number; ask: number };
    chile: { bid: number; ask: number };
    paraguay: { bid: number; ask: number };
    bolivia: { bid: number; ask: number };
    mexico: { bid: number; ask: number };
    uruguay: { bid: number; ask: number };
  };
  paymentServices: RemesasRate[];
}

/**
 * Hook que implementa carga progresiva específicamente para datos de remesas
 */
export function useProgressiveRemesasRates() {
  const { rates: latamRates } = useLatamRates();
  const { rates: exchangeRates } = useExchangeRatesData();
  
  // Inicializar Web Worker para cálculos
  const { calculateRates } = useWorker<{
    sendRates: Record<string, number | null>;
    receiveRates: Record<string, number | null>;
  }>('/workers/calcWorker.js');
  
  // Función para cargar datos críticos primero
  const loadCriticalData = useCallback(async (): Promise<CriticalData> => {
    // Obtener tasas base necesarias
    const venezuelaRate = latamRates.find(rate => rate.casa === 'venezuela');
    const dolarBlueRate = exchangeRates.find(rate => rate.casa === 'blue');
    
    // Validar datos esenciales
    if (!venezuelaRate || venezuelaRate.compra === null || venezuelaRate.venta === null) {
      throw new Error("Venezuelan exchange rate data is missing or incomplete.");
    }
    
    if (!dolarBlueRate || dolarBlueRate.compra === null) {
      throw new Error("Dólar Blue exchange rate data is missing or incomplete.");
    }
    
    // Obtener las APIs de remesas
    const remesasApiUrl = import.meta.env.VITE_REMESAS_API_URL;
    
    // Definir APIs críticas
    const criticalUrls = [
      `${remesasApiUrl}/USDT/COP/0.1`, // Colombia
      `${remesasApiUrl}/USDT/PEN/0.1`, // Perú
      `${remesasApiUrl}/USDT/ARS/0.1`, // Argentina
      `${remesasApiUrl}/USDT/USD/0.1`, // Ecuador (USD)
    ];
    
    const cacheTime = 600000; // 10 minutos
    const attempts = 3;
    
    // Obtener respuestas para países principales
    const responses = await Promise.all(
      criticalUrls.map(url => fetchWithCacheAndRetry(url, cacheTime, attempts))
    );
    
    // Procesar respuestas
    const [colombia, peru, argentina, ecuador] = await Promise.all(
      responses.map(response => response.json())
    );
    
    // Construir objeto de datos de países críticos
    const criticalCountries = {
      venezuela: {
        compra: venezuelaRate.compra,
        venta: venezuelaRate.venta
      },
      colombia: { bid: colombia.bid, ask: colombia.ask },
      peru: { bid: peru.bid, ask: peru.ask },
      argentina: { bid: argentina.bid },
      ecuador: { bid: ecuador.bid, ask: ecuador.ask }
    };
    
    // Usar worker para calcular tasas
    const workerData = {
      calculationType: 'remesasRates',
      dolarBlueCompra: dolarBlueRate.compra,
      argentinaBid: argentina.bid,
      marketRates: criticalCountries
    };
    
    const results = await calculateRates(workerData);
    
    // Crear tasas de remesas para países críticos
    const criticalRates = [
      {
        country: 'Venezuela',
        sendRate: venezuelaRate.venta,
        receiveRate: results.receiveRates.venezuela || null,
        flag: '/flags/venezuela.svg',
      },
      {
        country: 'Colombia',
        sendRate: results.sendRates.colombia || null,
        receiveRate: results.receiveRates.colombia || null,
        flag: '/flags/colombia.svg',
      },
      {
        country: 'Perú',
        sendRate: results.sendRates.peru || null,
        receiveRate: results.receiveRates.peru || null,
        flag: '/flags/peru.svg',
      },
      {
        country: 'Ecuador',
        sendRate: results.sendRates.ecuador || null,
        receiveRate: results.receiveRates.ecuador || null,
        flag: '/flags/ecuador.svg',
      },
    ];
    
    return {
      countries: criticalCountries,
      dolarBlueCompra: dolarBlueRate.compra,
      criticalRates
    };
  }, [latamRates, exchangeRates, calculateRates]);
  
  // Función para cargar datos secundarios después
  const loadSecondaryData = useCallback(async (criticalData: CriticalData): Promise<SecondaryData> => {
    const remesasApiUrl = import.meta.env.VITE_REMESAS_API_URL;
    
    // Definir APIs secundarias
    const secondaryUrls = [
      `${remesasApiUrl}/USDT/BRL/0.1`, // Brasil
      `${remesasApiUrl}/USDT/CLP/0.1`, // Chile
      `${remesasApiUrl}/USDT/PYG/0.1`, // Paraguay
      `${remesasApiUrl}/USDT/BOB/0.1`, // Bolivia
      `${remesasApiUrl}/USDT/MXN/0.1`, // México
      `${remesasApiUrl}/USDT/UYU/0.1`, // Uruguay
    ];
    
    const cacheTime = 600000; // 10 minutos
    const attempts = 3;
    
    // Obtener respuestas para países secundarios
    const responses = await Promise.all(
      secondaryUrls.map(url => fetchWithCacheAndRetry(url, cacheTime, attempts))
    );
    
    // Procesar respuestas
    const [brasil, chile, paraguay, bolivia, mexico, uruguay] = await Promise.all(
      responses.map(response => response.json())
    );
    
    // Construir objeto de datos secundarios
    const secondaryCountries = {
      brasil: { bid: brasil.bid, ask: brasil.ask },
      chile: { bid: chile.bid, ask: chile.ask },
      paraguay: { bid: paraguay.bid, ask: paraguay.ask },
      bolivia: { bid: bolivia.bid, ask: bolivia.ask },
      mexico: { bid: mexico.bid, ask: mexico.ask },
      uruguay: { bid: uruguay.bid, ask: uruguay.ask }
    };
    
    // Combinar los datos críticos y secundarios para el worker
    const combinedMarketRates = {
      ...criticalData.countries,
      ...secondaryCountries
    };
    
    // Calcular tasas mediante worker
    const workerData = {
      calculationType: 'remesasRates',
      dolarBlueCompra: criticalData.dolarBlueCompra,
      argentinaBid: criticalData.countries.argentina.bid,
      marketRates: combinedMarketRates
    };
    
    const results = await calculateRates(workerData);
    
    // Crear tasas de remesas para países secundarios
    const secondaryRates = [
      {
        country: 'Chile',
        sendRate: results.sendRates.chile || null,
        receiveRate: results.receiveRates.chile || null,
        flag: '/flags/chile.svg',
      },
      {
        country: 'Brasil',
        sendRate: results.sendRates.brasil || null,
        receiveRate: results.receiveRates.brasil || null,
        flag: '/flags/brasil.svg',
      },
      {
        country: 'Paraguay',
        sendRate: results.sendRates.paraguay || null,
        receiveRate: results.receiveRates.paraguay || null,
        flag: '/flags/paraguay.svg',
      },
      {
        country: 'Bolivia',
        sendRate: results.sendRates.bolivia || null,
        receiveRate: results.receiveRates.bolivia || null,
        flag: '/flags/bolivia.svg',
      },
      {
        country: 'México',
        sendRate: results.sendRates.mexico || null,
        receiveRate: results.receiveRates.mexico || null,
        flag: '/flags/mexico.svg',
      },
      {
        country: 'Uruguay',
        sendRate: results.sendRates.uruguay || null,
        receiveRate: results.receiveRates.uruguay || null,
        flag: '/flags/uruguay.svg',
      }
    ];
    
    return {
      countries: secondaryCountries,
      secondaryRates
    };
  }, [calculateRates]);
  
  // Función para combinar datos críticos y secundarios
  const combineData = useCallback((
    criticalData: CriticalData, 
    secondaryData: SecondaryData
  ): CombinedData => {
    // Combinar todos los datos de países
    const allMarketRates = {
      ...criticalData.countries,
      ...secondaryData.countries
    };
    
    // Calcular servicios de pago
    const paymentServices = [
      {
        country: 'PayPal',
        sendRate: criticalData.dolarBlueCompra ? criticalData.dolarBlueCompra * (1 - 0.12) : null,
        receiveRate: 0,
        flag: '/flags/paypal.svg',
      },
      {
        country: 'Zelle',
        sendRate: criticalData.dolarBlueCompra ? criticalData.dolarBlueCompra * (1 - 0.07) : null,
        receiveRate: 0,
        flag: '/flags/zelle.svg',
      }
    ];
    
    // Combinar todas las tasas
    const allRates = [
      ...criticalData.criticalRates,
      ...secondaryData.secondaryRates,
      ...paymentServices
    ];
    
    return {
      rates: allRates,
      allMarketRates,
      paymentServices
    };
  }, []);
  
  // Configurar el hook de carga progresiva
  const stagedData = useStagedDataLoading({
    loadCriticalData,
    loadSecondaryData,
    delay: 500,
    autoLoad: true,
    refreshInterval: 300000, // 5 minutos
    combineData
  });
  
  // Extraer solo los datos y estados relevantes para la interfaz
  const result = useMemo(() => {
    return {
      // Datos combinados
      rates: stagedData.combinedData?.rates || 
             stagedData.criticalData?.criticalRates || 
             [],
             
      // Estados de carga
      loading: stagedData.criticalLoading,
      secondaryLoading: stagedData.secondaryLoading,
      
      // Errores
      error: stagedData.criticalError?.message || null,
      
      // Acciones
      refresh: stagedData.loadAllData,
      
      // Metadatos
      lastUpdate: stagedData.lastUpdate,
      nextUpdate: 300 // Iniciar en 300 segundos (5 minutos)
    };
  }, [
    stagedData.combinedData,
    stagedData.criticalData,
    stagedData.criticalLoading,
    stagedData.secondaryLoading,
    stagedData.criticalError,
    stagedData.loadAllData,
    stagedData.lastUpdate
  ]);
  
  return result;
}
