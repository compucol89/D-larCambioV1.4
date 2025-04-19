import React, { useMemo } from 'react';
import DollarCard from '../components/DollarCard';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { motion } from 'framer-motion';
import { useExchangeRatesData } from '../hooks/useExchangeRatesData';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Rate } from '../types';

export function Home() {
  const { rates, error, loading, fetchRates, lastUpdate, nextUpdate } = useExchangeRatesData();

  // Memoizamos las funciones de búsqueda para evitar recrearlas en cada renderizado
  const blueRate = useMemo(() => rates?.find(r => r.casa === 'blue'), [rates]);
  const oficialRate = useMemo(() => rates?.find(r => r.casa === 'oficial'), [rates]);

  // Memoizamos la creación de tasas derivadas
  const paypalRate = useMemo<Rate | null>(() => {
    if (!blueRate) return null;
    
    return {
      casa: 'paypal',
      nombre: 'PayPal',
      compra: blueRate.compra ? blueRate.compra * 0.88 : null,
      venta: blueRate.venta ? blueRate.venta * 0.95 : null,
      fechaActualizacion: new Date().toISOString()
    };
  }, [blueRate]);

  const zelleRate = useMemo<Rate | null>(() => {
    if (!blueRate) return null;
    
    return {
      casa: 'zelle',
      nombre: 'Zelle',
      compra: blueRate.compra ? blueRate.compra * 0.93 : null,
      venta: blueRate.venta ? blueRate.venta * 0.93 : null,
      fechaActualizacion: new Date().toISOString()
    };
  }, [blueRate]);

  // Memoizamos el ordenamiento de rates para que solo se recalcule cuando rates cambie
  const orderedRates = useMemo<Rate[]>(() => {
    if (!rates) return [];

    // Filtrar los valores null y undefined antes de añadirlos al array
    const validRates: (Rate | null | undefined)[] = [
      blueRate,
      oficialRate,
      ...(rates.filter(r => r.casa !== 'blue' && r.casa !== 'oficial' && r.casa !== 'paypal' && r.casa !== 'zelle')),
      paypalRate,
      zelleRate
    ];
    
    // Asegurarnos de que no hay valores null o undefined
    return validRates.filter((rate): rate is Rate => !!rate);
  }, [rates, blueRate, oficialRate, paypalRate, zelleRate]);

  // Memoizamos la función que devuelve el rate de referencia
  const getReferenceRate = useMemo(() => {
    return (casa: string): Rate | undefined => {
      return casa === 'blue' ? oficialRate : blueRate;
    };
  }, [blueRate, oficialRate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <SEOHead
        title="Cotizaciones del Dólar en Argentina en Tiempo Real"
        description="Consulta las cotizaciones actualizadas del dólar en Argentina. Dólar blue, oficial, MEP, CCL y más. Información en tiempo real y confiable."
        path="/"
      />
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Cotizaciones Argentina
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Tipos de cambio actualizados
              </p>
              {lastUpdate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Última actualización: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                Próxima actualización en: <span className="font-medium">{nextUpdate}s</span>
              </p>
              <button
                onClick={fetchRates}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                aria-label="Actualizar cotizaciones"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
          {error ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{error}</p>
                  <p className="mt-1 text-sm opacity-90">
                    Los datos mostrados podrían estar desactualizados o ser aproximados.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={`skeleton-${i}`} className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                orderedRates.map((rate, index) => (
                  <motion.div
                    key={`rate-${rate.casa}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <DollarCard
                      rate={rate}
                      referenceRate={getReferenceRate(rate.casa)}
                    />
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
