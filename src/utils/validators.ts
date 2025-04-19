import { ExchangeRate, HistoricalDataPoint, DailyAverage } from '../types';

/**
 * Interfaz para tasas de cambio con formato diferente (usa 'fecha' en lugar de 'fechaActualizacion')
 */
export interface ServiceExchangeRate {
  compra: number | null;
  venta: number | null;
  fecha: string;
}

/**
 * Valida una tasa de cambio según la interfaz ExchangeRate de la API principal
 */
export function isValidExchangeRate(rate: any): rate is ExchangeRate {
  return (
    typeof rate === 'object' &&
    rate !== null &&
    typeof rate.casa === 'string' &&
    typeof rate.nombre === 'string' &&
    (typeof rate.compra === 'number' || rate.compra === null) &&
    (typeof rate.venta === 'number' || rate.venta === null) &&
    typeof rate.fechaActualizacion === 'string'
  );
}

/**
 * Valida una tasa de cambio según el formato específico de algunos servicios
 * que utilizan 'fecha' en lugar de 'fechaActualizacion'
 */
export function isValidServiceExchangeRate(rate: any): rate is ServiceExchangeRate {
  return (
    typeof rate === 'object' &&
    rate !== null &&
    (typeof rate.compra === 'number' || rate.compra === null) &&
    (typeof rate.venta === 'number' || rate.venta === null) &&
    typeof rate.fecha === 'string'
  );
}

/**
 * Valida un punto de datos históricos
 */
export function isValidHistoricalDataPoint(dataPoint: any): dataPoint is HistoricalDataPoint {
  return (
    typeof dataPoint === 'object' &&
    dataPoint !== null &&
    typeof dataPoint.fecha === 'string' &&
    typeof dataPoint.valor === 'number' &&
    typeof dataPoint.variacion === 'number'
  );
}

/**
 * Valida un promedio diario
 */
export function isValidDailyAverage(average: any): average is DailyAverage {
  return (
    typeof average === 'object' &&
    average !== null &&
    typeof average.fecha === 'string' &&
    typeof average.valor === 'number'
  );
}
