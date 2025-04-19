import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { SEOHead } from '../components/SEOHead';
import { RefreshCw, Search, MapPin, ArrowDown, Info, X } from 'lucide-react';
import RemesaCard from '../components/RemesaCard';
import { useProgressiveRemesasRates } from '../hooks/useProgressiveRemesasRates';
import { motion, AnimatePresence } from 'framer-motion';

export function Remesas() {
  const {
    rates,
    loading,
    secondaryLoading,
    error: _error, // Renombramos para ignorar el error
    refresh,
    lastUpdate,
    nextUpdate
  } = useProgressiveRemesasRates();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  
  // Prioridad de países
  const countryPriority = {
    'Venezuela': 1,
    'Colombia': 2,
    'Ecuador': 3,
    // Resto de países tendrán prioridad > 3
  };
  
  // Actualización del contador de tiempo
  const [displayedNextUpdate, setDisplayedNextUpdate] = useState(nextUpdate);
  
  useEffect(() => {
    setDisplayedNextUpdate(nextUpdate);
    
    const timer = setInterval(() => {
      setDisplayedNextUpdate(prev => {
        const newValue = prev - 5;
        return newValue > 0 ? newValue : nextUpdate;
      });
    }, 5000);
    
    return () => clearInterval(timer);
  }, [nextUpdate]);

  // Memoizar arreglos de tasas filtradas y ordenadas
  const sortedAndFilteredRates = useMemo(() => {
    // Filtrar por búsqueda
    let filteredRates = [...rates].filter(rate => 
      rate.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Ordenar según la prioridad definida
    return filteredRates.sort((a, b) => {
      const priorityA = countryPriority[a.country as keyof typeof countryPriority] || 100;
      const priorityB = countryPriority[b.country as keyof typeof countryPriority] || 100;
      
      // Primero ordenar por prioridad
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Si tienen la misma prioridad (no son países prioritarios), ordenar alfabéticamente
      return a.country.localeCompare(b.country);
    });
  }, [rates, searchTerm]);
  
  // Separar servicios de pago de países
  const countriesRates = useMemo(() => {
    return sortedAndFilteredRates.filter(
      (rate) => rate.country !== 'PayPal' && rate.country !== 'Zelle'
    );
  }, [sortedAndFilteredRates]);
  
  const servicesRates = useMemo(() => {
    return sortedAndFilteredRates.filter(
      (rate) => rate.country === 'PayPal' || rate.country === 'Zelle'
    );
  }, [sortedAndFilteredRates]);
  
  // Texto de última actualización memoizado
  const formattedLastUpdate = useMemo(() => {
    return lastUpdate.toLocaleString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, [lastUpdate]);

  // Loader personalizado para la carga inicial de la página
  if (loading && rates.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
        <SEOHead
          title="Cotizaciones de Remesas en Latinoamérica"
          description="Consulta las cotizaciones de remesas en diferentes países de Latinoamérica. Tipos de cambio actualizados para Colombia, Argentina, Brasil, Chile y Venezuela."
          path="/remesas"
        />
        <Header />
        
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin mb-4">
              <RefreshCw size={40} className="text-primary" />
            </div>
            <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">
              Cargando cotizaciones...
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Obteniendo las tasas más recientes
            </p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <SEOHead
        title="Cotizaciones de Remesas en Latinoamérica"
        description="Consulta las cotizaciones de remesas en diferentes países de Latinoamérica. Tipos de cambio actualizados para Colombia, Argentina, Brasil, Chile y Venezuela."
        path="/remesas"
      />
      <Header />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Encabezado con información del servicio y botón de ayuda */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Remesas Internacionales
                  </h2>
                  <button 
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                    aria-label="Mostrar información"
                  >
                    <Info size={18} />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Tipos de cambio para envío de dinero entre países
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Última actualización: {formattedLastUpdate}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-sm text-blue-700 dark:text-blue-300">
                  <RefreshCw size={14} />
                  <span className="font-medium">{displayedNextUpdate}s</span>
                </div>
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                  aria-label="Actualizar cotizaciones"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                  />
                  Actualizar
                </button>
              </div>
            </div>
            
            {/* Panel de información desplegable */}
            <AnimatePresence>
              {showInfo && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-2">¿Cómo funcionan las remesas?</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">
                        Las remesas son transferencias de dinero que un emigrante envía a su país de origen.
                        En esta página puedes calcular:
                      </p>
                      <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
                        <li>Cuántos dólares recibes al enviar pesos argentinos</li>
                        <li>Cuántos pesos argentinos recibes al enviar dólares por servicios como PayPal o Zelle</li>
                      </ul>
                    </div>
                    <button 
                      onClick={() => setShowInfo(false)}
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Barra de búsqueda simplificada */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                placeholder="Buscar país..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Indicadores de estado (cargando) - Solo mostrar indicadores de carga */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {loading && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Cargando datos críticos
                </span>
              )}
              
              {secondaryLoading && !loading && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Cargando datos completos
                </span>
              )}
              
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                  <Search className="h-3 w-3 mr-1" />
                  Búsqueda: "{searchTerm}"
                </span>
              )}
            </div>
          </div>
          
          {/* Contenedor principal con las tarjetas */}
          <div className="mb-8">
            {countriesRates.length === 0 && servicesRates.length === 0 && !(loading || secondaryLoading) ? (
              // No hay resultados después de aplicar filtros
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No se encontraron resultados</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No hay países que coincidan con tu búsqueda.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors inline-flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <>
                {/* Cargar esqueletos durante la carga inicial o secundaria */}
                {(loading || secondaryLoading) && (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {Array(loading ? 4 : 3)
                      .fill(null)
                      .map((_, i) => (
                        <div
                          key={`skeleton-${i}`}
                          className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-4 sm:p-6 animate-pulse"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                            <div className="text-right">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                
                {/* Sección de países */}
                {countriesRates.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                      Países
                      <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({countriesRates.length})
                      </span>
                    </h3>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8">
                      {countriesRates.map((rate) => (
                        <motion.div
                          key={rate.country}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RemesaCard
                            country={rate.country}
                            sendRate={rate.sendRate}
                            receiveRate={rate.receiveRate}
                            flag={rate.flag}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Sección de servicios de pago */}
                {servicesRates.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                      <ArrowDown className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" />
                      Servicios de Pago
                      <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({servicesRates.length})
                      </span>
                    </h3>
                    
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {servicesRates.map((rate) => (
                        <motion.div
                          key={rate.country}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <RemesaCard
                            country={rate.country}
                            sendRate={rate.sendRate}
                            receiveRate={rate.receiveRate}
                            flag={rate.flag}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Eliminamos completamente el AsyncStateHandler para errores */}
        </div>
      </main>

      <Footer />
    </div>
  );
}
