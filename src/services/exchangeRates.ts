import { fetchWithRetry, fetchWithCacheAndRetry } from './utils';
import { DailyAverage } from '../types';
import { isValidServiceExchangeRate, isValidDailyAverage, ServiceExchangeRate } from '../utils/validators';

export async function getLatestRates(signal?: AbortSignal): Promise<ServiceExchangeRate[]> {
  try {
    const response = await fetchWithCacheAndRetry('https://dolarapi.com/v1/dolares', 300000, 3, signal);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const data = await response.json();
    if (Array.isArray(data) && data.every(isValidServiceExchangeRate)) {
      return data;
    } else {
      throw new Error('Invalid data format received from API: latest rates');
    }
  } catch (error) {
    console.error('Error fetching latest rates:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch latest rates');
  }
}

export async function getDailyAverages(days: number = 7, signal?: AbortSignal): Promise<DailyAverage[]> {
  try {
    const response = await fetchWithCacheAndRetry('https://dolarg-api.hola6290.workers.dev', 3600000, 3, signal);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const data = await response.json();
    if (data && Array.isArray(data.historical) && data.historical.slice(0, days).every(isValidDailyAverage)) {
      return data.historical.slice(0, days);
    } else {
      throw new Error('Invalid data format received from API: daily averages');
    }
  } catch (error) {
    console.error('Error fetching daily averages:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch daily averages');
  }
}
