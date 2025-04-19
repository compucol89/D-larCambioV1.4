import React, { useEffect, useRef, useCallback, memo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, ArrowRight, ExternalLink, ArrowUpDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { fetchWithRetry } from '../services/utils';
import { useBlueDollarRate } from '../hooks/useBlueDollarRate';
import { Rate } from '../types';

interface DollarCardProps {
  rate: Rate;
  referenceRate?: Rate;
  formatVenta?: (value: number | null) => string;
}

const DollarCard = ({ rate, referenceRate, formatVenta }: DollarCardProps) => {
  const controls = useAnimation();
  const prevValues = useRef({ compra: rate.compra, venta: rate.venta });
  const location = useLocation();
  
  // Usar el hook centralizado solo cuando sea necesario
  const { blueDollarVenta } = rate.casa === 'venezuela' ? useBlueDollarRate() : { blueDollarVenta: null };

  useEffect(() => {
    if (rate.compra !== prevValues.current.compra || rate.venta !== prevValues.current.venta) {
      controls.start({
        scale: [1, 1.02, 1],
        transition: { duration: 0.3 }
      });

      prevValues.current = { compra: rate.compra, venta: rate.venta };
    }
  }, [rate.compra, rate.venta, controls]);

  // Memoizar funciones de formato que se usan en el render
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const formatCurrency = useCallback((value: number | null) => {
    if (value === null) return 'No disponible';
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }, []);

  const formatVariation = useCallback((variation: number | null | undefined) => {
    if (variation === undefined || variation === null) {
      return ''; // Return empty string when variation is null or undefined
    }
    const formattedVariation = Math.abs(variation).toFixed(2);
    const sign = variation >= 0 ? '+' : '-';
    return `${sign}${formattedVariation}%`;
  }, []);

  const getVariationColor = useCallback((variation?: number | null, isTrm: boolean = false) => {
    if (isTrm) return 'text-gray-500 dark:text-gray-400';
    if (variation === undefined || variation === null) return 'text-gray-500 dark:text-gray-400';
    if (variation > 0) return 'text-green-500 dark:text-green-400';
    if (variation < 0) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  }, []);

  const getVariationIcon = useCallback((variation?: number | null) => {
    if (variation === undefined || variation === null) return <ArrowRight className="h-3 w-3" />;
    if (variation > 0) return <TrendingUp className="h-3 w-3" />;
    if (variation < 0) return <TrendingDown className="h-3 w-3" />;
    return <ArrowRight className="h-3 w-3" />;
  }, []);

  const calculateVariation = useCallback((current: number | null, reference: number | null) => {
    if (current === null || reference === null || reference === 0) return null;
    return ((current - reference) / reference) * 100;
  }, []);

  /**
   * Calcula el spread estándar entre compra y venta
   * Fórmula: ((venta - compra) / compra) * 100
   */
  const calculateSpread = useCallback((compra: number | null, venta: number | null): number | null => {
    if (compra === null || venta === null || compra === 0) return null;
    return ((venta - compra) / compra) * 100;
  }, []);

  /**
   * Calcula el spread para el caso de Venezuela
   * Compara el precio de compra local con el dólar blue de Argentina
   * No aplica un ajuste estático, ya que los mercados son dinámicos
   */
  const calculateVenezuelaSpread = (blueDollarVenta: number | null, compra: number | null, venta: number | null): number | null => {
    // Si tenemos datos de compra y venta locales, calculamos el spread normal
    if (compra !== null && venta !== null && compra !== 0) {
      return calculateSpread(compra, venta);
    }
    
    // Si tenemos el dólar blue y compra, podemos calcular un spread referencial
    if (blueDollarVenta !== null && compra !== null && compra !== 0) {
      // La comparación debe ser relativa al mercado, sin ajustes estáticos
      return ((blueDollarVenta / compra) - 1) * 100;
    }
    
    return null;
  };

  /**
   * Determina qué método de cálculo de spread usar según el tipo de moneda
   */
  const getSpread = (): number | null => {
    // Caso especial para Venezuela
    if (rate.casa === 'venezuela') {
      return calculateVenezuelaSpread(blueDollarVenta, rate.compra, rate.venta);
    }
    
    // Caso estándar: calculamos el spread entre compra y venta
    return calculateSpread(rate.compra, rate.venta);
  };

  const variations = {
    daily: rate.variacionVenta ?? null,
    spread: getSpread(),
    vsReference: referenceRate?.venta !== undefined && rate.venta !== null
      ? calculateVariation(rate.venta, referenceRate.venta)
      : null,
    trm: location.pathname === '/latam' && rate.casa === 'colombia' 
      ? rate.variacionVenta ?? null
      : null,
    tasaArgentina: location.pathname === '/latam' && rate.casa === 'venezuela' 
      ? rate.venta
      : null
  };

  const getCardLink = () => {
    switch (rate.casa) {
      case 'blue':
        return '/dolar-blue';
      case 'oficial':
        return '/dolar-oficial';
      case 'bolsa':
        return '/dolar-mep';
      default:
        return null;
    }
  };

  const cardLink = getCardLink();

  const formatDollarType = (casa: string, nombre: string) => {
    if (casa === 'blue') return 'Dólar Blue';
    if (casa === 'bolsa') return 'Bolsa/MEP';
    if (casa === 'ccl' || nombre.toLowerCase().includes('contado con liquidación')) return 'CCL';
    if (casa === 'paypal') return 'PayPal';
    if (casa === 'zelle') return 'Zelle';
    return nombre;
  };

  const getIcon = (casa: string) => {
    // En la ruta de latam, mostrar banderas de países
    if (location.pathname === '/latam') {
      if (casa === 'venezuela') {
        return <img src="/flags/venezuela.svg" alt="Bandera de Venezuela" className="w-full h-full object-cover" />;
      }
      if (casa === 'colombia') {
        return <img src="/flags/colombia.svg" alt="Bandera de Colombia" className="w-full h-full object-cover" />;
      }
    }
    
    // Para otras rutas, usar los íconos anteriores
    if (casa === 'paypal') return <span className="font-bold text-vibrant-primary dark:text-blue-400">P</span>;
    if (casa === 'zelle') return <span className="font-bold text-vibrant-primary dark:text-blue-400">Z</span>;
    return <DollarSign className="h-6 w-6 text-vibrant-primary dark:text-blue-400" />;
  };

  const getComparisonLabel = () => {
    return rate.casa === 'blue' ? 'Vs. Dólar Oficial' : 'Vs. Dólar Blue';
  };

  const calculateAverage = (buy: number | null, sell: number | null): string | null => {
    if (buy === null || sell === null) return null;
    const average = (buy + sell) / 2;
    return formatCurrency(average);
  };

  const formatDisplayValue = (value: number | null, isVenta: boolean = false) => {
    if (value === null) return 'No disponible';
    const isLatamVenezuela = location.pathname === '/latam' && rate.casa === 'venezuela';

    if (isLatamVenezuela) {
      // Para Venezuela en Latam, mostrar 2 decimales
      return value.toFixed(2);
    }
    
    return value.toLocaleString('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatTasaDeCambio = (value: number | null) => {
    if (value === null) return 'No disponible';
    const safeValue = value || 0; // Asegurar que nunca sea null
    return safeValue.toLocaleString('es-AR', {
      maximumFractionDigits: 4,
      minimumFractionDigits: 4
    }).replace(/,/g, '.');
  };

  return (
    <motion.article
      animate={controls}
      className="relative overflow-hidden bg-white dark:bg-dark-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md bg-white/30 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10" />
      
      <div className="relative p-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.3 }}
              className={location.pathname === '/latam' ? 
                "w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center overflow-hidden" : 
                "p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full"}
            >
              {getIcon(rate.casa)}
            </motion.div>
            {cardLink ? (
              <Link 
                to={cardLink}
                className="group flex items-center text-lg font-semibold text-gray-800 dark:text-white hover:text-vibrant-primary dark:hover:text-blue-400 transition-colors"
              >
                {formatDollarType(rate.casa, rate.nombre)}
                <ExternalLink className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {formatDollarType(rate.casa, rate.nombre)}
              </h3>
            )}
          </div>
          {/* Display Tasas Oficiales para Venezuela y Colombia en Latam, independientemente de variations.daily */}
          {location.pathname === '/latam' && (rate.casa === 'venezuela' || rate.casa === 'colombia') ? (
            <div className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                <span className="text-blue-600 dark:text-blue-300 font-medium">Tasas Oficiales</span>
              </div>
            </div>
          ) : variations.daily === null || variations.daily === undefined ? (
            <div className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              {rate.compra !== null && rate.venta !== null && (
                <span>$ {calculateAverage(rate.compra, rate.venta)}</span>
              )}
            </div>
          ) : (
            <div className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(variations.daily)}`}>
              {getVariationIcon(variations.daily)}
              <span className="font-medium">
                {formatVariation(variations.daily)}
              </span>
            </div>
          )}
        </div>

        {/* Valores principales */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {rate.casa === 'venezuela' ? 'Dólar Paralelo' : 'Compra'}
            </span>
            <motion.span
              className="text-3xl font-bold text-vibrant-primary dark:text-blue-400"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {rate.casa === 'venezuela' ? (
                <span className="flex items-baseline">
                  $ {formatDisplayValue(rate.compra)}
                  <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">USD</span>
                </span>
              ) : (
                <span>$ {formatDisplayValue(rate.compra)}</span>
              )}
            </motion.span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300 font-medium">
              {rate.casa === 'venezuela' ? 'Tasa ARS/VES' : 'Venta'}
            </span>
            <motion.span
              className="text-3xl font-bold text-vibrant-secondary dark:text-blue-300"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {rate.casa === 'venezuela' ? (
                <span className="flex items-baseline">
                  <span>{rate.venta !== null ? formatTasaDeCambio(rate.venta) : 'No disponible'}</span>
                  <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">VES</span>
                </span>
              ) : (
                <span>$ {formatVenta && rate.venta !== null ? formatVenta(rate.venta) : formatDisplayValue(rate.venta, true)}</span>
              )}
            </motion.span>
          </div>
          
          {/* Información de tasas de remesas - Colombia */}
          {location.pathname === '/latam' && rate.casa === 'colombia' && (
            <div className="mt-1 mb-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <div>$100.000 ARS ≈ 335.000 COP</div>
              <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">Tasa de remesas: 1 ARS = 3,35 COP</div>
            </div>
          )}
          
          {/* Información de tasas de remesas - Venezuela */}
          {location.pathname === '/latam' && rate.casa === 'venezuela' && rate.venta !== null && (
            <div className="mt-1 mb-3 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
              <div>$100.000 ARS ≈ 7.467 VES</div>
              <div className="text-xs mt-1 text-gray-600 dark:text-gray-400">Tasa de remesas: 1 ARS = 0,0747 VES</div>
            </div>
          )}
        </div>

        {/* Variaciones */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
              <ArrowUpDown className="h-4 w-4" />
              <span>Spread</span>
            </div>
            <div className={`flex items-center gap-1 ${getVariationColor(variations.spread)}`}>
              {getVariationIcon(variations.spread)}
              <span className="font-medium">
                {formatVariation(variations.spread)}
              </span>
            </div>
          </div>
          {/* Display comparison if vsReference is not null */}
          {variations.vsReference !== null && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{getComparisonLabel()}</span>
              <div className={`flex items-center gap-1 ${getVariationColor(variations.vsReference)}`}>
                {getVariationIcon(variations.vsReference)}
                <span className="font-medium">
                  {formatVariation(variations.vsReference)}
                </span>
              </div>
            </div>
          )}
          {variations.trm !== null && (
            <div className="flex justify-between items-center text-sm group relative">
              <span className="text-gray-500 dark:text-gray-400 flex items-center">
                TRM
                <span className="ml-1 text-xs text-blue-500 dark:text-blue-400 cursor-help">
                  (?)
                  <div className="absolute left-0 bottom-full mb-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 text-xs text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    TRM (Tasa Representativa del Mercado) es la tasa de cambio oficial del peso colombiano frente al dólar estadounidense.
                  </div>
                </span>
              </span>
              <div className={`flex items-center gap-1 ${getVariationColor(variations.trm, true)}`}>
                {getVariationIcon(variations.trm)}
                <span className="font-medium">
                  {formatVariation(variations.trm)}
                </span>
              </div>
            </div>
          )}
          {variations.tasaArgentina !== null && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Tasa de Cambio
              </span>
              <div className={`flex items-center gap-1 ${getVariationColor(variations.tasaArgentina, true)}`}>
                {getVariationIcon(variations.tasaArgentina)}
                <span className="font-medium">
                  {rate.casa === 'venezuela' 
                    ? `1 ARS = ${formatTasaDeCambio(variations.tasaArgentina)} VES`
                    : formatTasaDeCambio(variations.tasaArgentina)
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Fecha de actualización */}
        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Actualizado: {formatDate(rate.fechaActualizacion)}
        </div>
      </div>
    </motion.article>
  );
};

// Personalizar la comparación para evitar renderizados innecesarios
export default memo(DollarCard, (prevProps, nextProps) => {
  // Comparación más detallada para optimizar re-renders
  return (
    prevProps.rate.fechaActualizacion === nextProps.rate.fechaActualizacion &&
    prevProps.rate.compra === nextProps.rate.compra &&
    prevProps.rate.venta === nextProps.rate.venta &&
    prevProps.referenceRate?.fechaActualizacion === nextProps.referenceRate?.fechaActualizacion &&
    prevProps.referenceRate?.compra === nextProps.referenceRate?.compra &&
    prevProps.referenceRate?.venta === nextProps.referenceRate?.venta &&
    (prevProps.formatVenta === nextProps.formatVenta)
  );
});
