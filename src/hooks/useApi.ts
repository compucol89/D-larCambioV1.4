import { useState, useEffect } from 'react';
import { getExchangeRates, getHistoricalRates } from '../services/api';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useExchangeRates(): ApiResponse<any[]> {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setLoading(true);
      const response = await getExchangeRates(signal);
      if (!signal.aborted) {
        setData(response.data);
        setError(response.error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);

    return () => {
      clearInterval(interval);
      abortController.abort();
    };
  }, []);

  return { data, error, loading };
}

export function useHistoricalRates(type: string): ApiResponse<any[]> {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchData = async () => {
      setLoading(true);
      const response = await getHistoricalRates(type, signal);
      if (!signal.aborted) {
        setData(response.data);
        setError(response.error);
        setLoading(false);
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [type]);

  return { data, error, loading };
}
