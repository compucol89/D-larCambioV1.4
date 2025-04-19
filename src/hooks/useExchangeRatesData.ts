import { useState, useEffect, useCallback, useRef } from 'react';
import { getExchangeRates } from '../services/api';
import { Rate } from '../types';

const UPDATE_INTERVAL = 300000; // 5 minutes

export function useExchangeRatesData() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [nextUpdate, setNextUpdate] = useState<number>(UPDATE_INTERVAL / 1000);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRates = useCallback(async () => {
    // Abortar cualquier solicitud previa antes de iniciar una nueva
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Crear un nuevo controlador para esta solicitud
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getExchangeRates(signal);
      
      // Si la solicitud fue abortada (componente desmontado), no continuar
      if (signal.aborted) {
        return;
      }
      
      if (response.data) {
        // Validate the format of each rate object
        const validRates = response.data.filter(rate => 
          rate.casa && typeof rate.casa === 'string' &&
          rate.nombre && typeof rate.nombre === 'string' &&
          (typeof rate.compra === 'number' || rate.compra === null) &&
          (typeof rate.venta === 'number' || rate.venta === null) &&
          rate.fechaActualizacion && typeof rate.fechaActualizacion === 'string'
        );
        if (validRates.length !== response.data.length) {
          console.warn('Some rates had invalid format and were filtered out');
        }
        setRates(validRates);
        setLastUpdate(new Date());
        setNextUpdate(UPDATE_INTERVAL / 1000);
      } else if (response.error && !signal.aborted) {
        setError('Error al obtener las cotizaciones. Por favor, intente nuevamente.');
      }
    } catch (err) {
      // Solo actualizar el estado de error si no fue un error de aborto y el componente sigue montado
      if (!signal.aborted) {
        setError('Error al obtener las cotizaciones. Por favor, intente nuevamente.');
        console.error('Error:', err);
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

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
      setNextUpdate(prev => {
        const newValue = prev - 5;
        return newValue > 0 ? newValue : UPDATE_INTERVAL / 1000;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return { rates, loading, error, fetchRates, lastUpdate, nextUpdate };
}
