import { useState, useEffect, useCallback } from 'react';

/**
 * Tipos de datos para el hook de carga progresiva
 */
export interface StagedLoadingOptions<T, U> {
  // Función para cargar datos críticos
  loadCriticalData: () => Promise<T>;
  
  // Función para cargar datos secundarios (no críticos)
  loadSecondaryData: (criticalData: T) => Promise<U>;
  
  // Tiempo de retraso entre la carga de datos críticos y secundarios (ms)
  delay?: number;
  
  // Si los datos deben cargarse automáticamente al montar
  autoLoad?: boolean;
  
  // Intervalo de actualización automática (ms), 0 desactiva la actualización
  refreshInterval?: number;
  
  // Función para combinar datos críticos y secundarios (opcional)
  combineData?: (critical: T, secondary: U) => any;
}

/**
 * Hook personalizado para implementar carga progresiva de datos
 * Primero carga datos críticos y luego los secundarios con un retraso configurable
 */
export function useStagedDataLoading<T, U>({
  loadCriticalData,
  loadSecondaryData,
  delay = 300,
  autoLoad = true,
  refreshInterval = 0,
  combineData
}: StagedLoadingOptions<T, U>) {
  // Estados para datos críticos
  const [criticalData, setCriticalData] = useState<T | null>(null);
  const [criticalLoading, setCriticalLoading] = useState<boolean>(false);
  const [criticalError, setCriticalError] = useState<Error | null>(null);
  
  // Estados para datos secundarios
  const [secondaryData, setSecondaryData] = useState<U | null>(null);
  const [secondaryLoading, setSecondaryLoading] = useState<boolean>(false);
  const [secondaryError, setSecondaryError] = useState<Error | null>(null);
  
  // Estado para datos combinados (si se proporciona combineData)
  const [combinedData, setCombinedData] = useState<any>(null);
  
  // Estado para seguimiento de última actualización
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Función para cargar datos críticos
  const loadCritical = useCallback(async () => {
    setCriticalLoading(true);
    setCriticalError(null);
    
    try {
      const data = await loadCriticalData();
      setCriticalData(data);
      setLastUpdate(new Date());
      return data;
    } catch (err) {
      setCriticalError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setCriticalLoading(false);
    }
  }, [loadCriticalData]);
  
  // Función para cargar datos secundarios
  const loadSecondary = useCallback(async (criticalDataForLoad: T | null) => {
    // No cargar datos secundarios si no hay datos críticos
    if (!criticalDataForLoad) return null;
    
    setSecondaryLoading(true);
    setSecondaryError(null);
    
    try {
      const data = await loadSecondaryData(criticalDataForLoad);
      setSecondaryData(data);
      
      // Si existe función para combinar datos, actualizamos el estado combinado
      if (combineData && criticalDataForLoad) {
        const combined = combineData(criticalDataForLoad, data);
        setCombinedData(combined);
      }
      
      return data;
    } catch (err) {
      setSecondaryError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setSecondaryLoading(false);
    }
  }, [loadSecondaryData, combineData]);
  
  // Función para cargar todos los datos de forma progresiva
  const loadAllData = useCallback(async () => {
    const critical = await loadCritical();
    
    // Si la carga crítica falla, no continuar con la carga secundaria
    if (!critical) return { critical: null, secondary: null };
    
    // Retrasar la carga de datos secundarios
    await new Promise(resolve => setTimeout(resolve, delay));
    const secondary = await loadSecondary(critical);
    
    return { critical, secondary };
  }, [loadCritical, loadSecondary, delay]);
  
  // Cargar datos al montar el componente (si autoLoad es true)
  useEffect(() => {
    if (autoLoad) {
      loadAllData();
    }
  }, [autoLoad, loadAllData]);
  
  // Configurar actualización periódica (si refreshInterval > 0)
  useEffect(() => {
    if (refreshInterval <= 0) return;
    
    const intervalId = setInterval(() => {
      loadAllData();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, loadAllData]);
  
  // Actualizar datos combinados cuando cambian los datos críticos o secundarios
  useEffect(() => {
    if (combineData && criticalData && secondaryData) {
      const combined = combineData(criticalData, secondaryData);
      setCombinedData(combined);
    }
  }, [criticalData, secondaryData, combineData]);
  
  return {
    // Datos
    criticalData,
    secondaryData,
    combinedData: combineData ? combinedData : undefined,
    
    // Estados de carga
    criticalLoading,
    secondaryLoading,
    loading: criticalLoading || secondaryLoading,
    
    // Errores
    criticalError,
    secondaryError,
    
    // Acciones
    loadCritical,
    loadSecondary,
    loadAllData,
    
    // Metadatos
    lastUpdate
  };
}
