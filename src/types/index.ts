/**
 * Tipos globales para la aplicación DolarCambio
 * Este archivo centraliza todas las interfaces comunes para evitar duplicación e inconsistencias
 */

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  timestamp: string;
  aborted?: boolean;
}

/**
 * Estructura básica de una tasa de cambio
 */
export interface Rate {
  casa: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  fechaActualizacion: string;
  variacionCompra?: number;
  variacionVenta?: number;
}

/**
 * Estructura de una tasa de cambio de la API externa
 */
export interface ExchangeRate {
  casa: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  fechaActualizacion: string;
}

/**
 * Punto de datos para información histórica
 */
export interface HistoricalDataPoint {
  fecha: string;
  valor: number;
  variacion: number;
}

/**
 * Respuesta de la API de datos históricos
 */
export interface HistoricalApiResponse {
  latest: HistoricalDataPoint[];
  historical: HistoricalDataPoint[];
}

/**
 * Estructura para promedio diario
 */
export interface DailyAverage {
  fecha: string;
  valor: number;
}

/**
 * Estructura para tasas de remesas entre países
 */
export interface RemesaRate {
  country: string;
  code: string;
  flag: string;
  exchangeRate: number;
  currencySymbol: string;
}
