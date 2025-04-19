import { fetchWithRetry, fetchWithCacheAndRetry } from './utils';
import { 
  ApiResponse, 
  ExchangeRate, 
  HistoricalDataPoint, 
  HistoricalApiResponse 
} from '../types';
import {
  isValidExchangeRate,
  isValidHistoricalDataPoint
} from '../utils/validators';

export async function getExchangeRates(signal?: AbortSignal): Promise<ApiResponse<ExchangeRate[]>> {
  try {
    // Usar caché con tiempo de expiración de 5 minutos para tasas de cambio actuales
    const response = await fetchWithCacheAndRetry(`${import.meta.env.VITE_API_URL}/dolares`, 300000, 3, signal);
    
    // Comprobar si la solicitud fue abortada
    if (response.status === 499) {
      console.log('Exchange rates request was aborted');
      return {
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
        aborted: true
      };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const data = await response.json();

    if (Array.isArray(data) && data.every(isValidExchangeRate)) {
      return {
        data,
        error: null,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Invalid data format received from API: exchange rates');
    }
  } catch (error) {
    // No registrar errores de aborto como errores completos
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Exchange rates request was aborted during execution');
      return {
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
        aborted: true
      };
    }
    
    console.error('Error fetching exchange rates:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
}

export async function getHistoricalRates(type: string, signal?: AbortSignal): Promise<ApiResponse<HistoricalDataPoint[]>> {
  try {
    // Usar caché con tiempo de expiración de 1 hora para datos históricos
    const response = await fetchWithCacheAndRetry(`${import.meta.env.VITE_HISTORICAL_API_URL}`, 3600000, 3, signal);
    
    // Comprobar si la solicitud fue abortada
    if (response.status === 499) {
      console.log('Historical rates request was aborted');
      return {
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
        aborted: true
      };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data: HistoricalApiResponse = await response.json();

    const validData = type === 'blue' || type === 'oficial' ? data.historical : data.latest;
    if (Array.isArray(validData) && validData.every(isValidHistoricalDataPoint)) {
      return {
        data: validData,
        error: null,
        timestamp: new Date().toISOString()
      };
    } else {
      throw new Error('Invalid data format received from API: historical rates');
    }
  } catch (error) {
    // No registrar errores de aborto como errores completos
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Historical rates request was aborted during execution');
      return {
        data: null,
        error: null,
        timestamp: new Date().toISOString(),
        aborted: true
      };
    }
    
    console.error('Error getting historical rates:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    };
  }
}
