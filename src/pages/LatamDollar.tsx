import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import DollarCard from '../components/DollarCard';
import { RefreshCw } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useLatamRates } from '../hooks/useLatamRates';
import { AsyncStateHandler } from '../components/AsyncStateHandler';

export function LatamDollar() {
  const { rates, loading, error, fetchRates, lastUpdate, nextUpdate } = useLatamRates();

  const formatRemesasPrice = (value: number | null): string => {
    if (value === null) return 'No disponible';
    return value.toFixed(4);
  };

  // Componentes de carga personalizados para la cuadrícula
  const loadingGrid = (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      {Array(2).fill(0).map((_, i) => (
        <div key={`skeleton-${i}`} className="bg-white dark:bg-dark-card rounded-lg shadow-md p-4 sm:p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <SEOHead
        title="Cotizaciones del Dólar en Latinoamérica"
        description="Consulta las cotizaciones del dólar en países de Latinoamérica. Tipos de cambio actualizados para Venezuela, Colombia y más."
        path="/latam"
      />
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Cotizaciones Latinoamérica
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Tipos de cambio en Venezuela y Colombia
              </p>
              {lastUpdate && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Actualizado: {new Date(lastUpdate).toLocaleString()}
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

          <AsyncStateHandler 
            loading={loading} 
            error={error} 
            retry={fetchRates}
            loadingComponent={loadingGrid}
          >
            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
              {rates.map((rate, index) => (
                <DollarCard
                  key={`rate-${rate.casa}-${index}`}
                  rate={rate}
                  formatVenta={rate.casa === 'venezuela' ? formatRemesasPrice : undefined}
                />
              ))}
            </div>
          </AsyncStateHandler>
        </div>
      </main>

      <Footer />
    </div>
  );
}
