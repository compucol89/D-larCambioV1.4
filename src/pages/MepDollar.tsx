import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { TrendingUp, TrendingDown, ArrowRight, RefreshCw, DollarSign, Info, ExternalLink } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Link } from 'react-router-dom';
import { fetchWithRetry } from '../services/utils';

interface Rate {
  casa: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  fechaActualizacion: string;
  variacionCompra?: number;
  variacionVenta?: number;
}

export function MepDollar() {
  const [rate, setRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextUpdate, setNextUpdate] = useState(60);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchMepDollar = async () => {
      try {
        setLoading(true);
        const response = await fetchWithRetry('https://dolarapi.com/v1/dolares/bolsa');
        if (!response.ok) throw new Error('Error al obtener datos');
        const data = await response.json();
        setRate(data);
        setLastUpdate(new Date(data.fechaActualizacion));
        setNextUpdate(60);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMepDollar();
    const interval = setInterval(fetchMepDollar, 60000); // Actualizar cada minuto
    
    // Contador regresivo para próxima actualización
    const timer = setInterval(() => {
      setNextUpdate(prev => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return 'No disponible';
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatVariation = (variation?: number | null) => {
    // Primero verificamos que no sea undefined o null
    if (variation === undefined || variation === null) {
      return '';
    }
    // Verificación adicional para asegurarnos que variation sea un número válido
    if (typeof variation !== 'number' || isNaN(variation)) {
      return '';
    }
    // Solo ahora que estamos seguros que es un número, usamos toFixed
    return `${variation > 0 ? '+' : ''}${variation.toFixed(2)}%`;
  };

  const getVariationColor = (variation?: number | null) => {
    if (variation === undefined || variation === null) return 'text-gray-500';
    if (variation > 0) return 'text-green-500 dark:text-green-400';
    if (variation < 0) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getVariationIcon = (variation?: number | null) => {
    if (variation === undefined || variation === null) return <ArrowRight className="h-4 w-4" />;
    if (variation > 0) return <TrendingUp className="h-4 w-4" />;
    if (variation < 0) return <TrendingDown className="h-4 w-4" />;
    return <ArrowRight className="h-4 w-4" />;
  };

  // Calcular el spread entre compra y venta
  const calculateSpread = () => {
    if (rate?.compra && rate?.venta) {
      return ((rate.venta - rate.compra) / rate.compra) * 100;
    }
    return null;
  };

  const spread = calculateSpread();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <SEOHead
        title="Dólar MEP Hoy | Cotización Actualizada en Tiempo Real | Argentina"
        description="Cotización actualizada al minuto del dólar MEP en Argentina. Precio de compra y venta, variaciones diarias, comparativas y todo lo que necesitas saber sobre el dólar bolsa."
        path="/dolar-mep"
      />
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado principal con datos destacados */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <DollarSign className="h-8 w-8 mr-2" />
                Dólar MEP Hoy
              </h1>
              <p className="text-blue-100">
                Cotización actualizada en tiempo real para Argentina
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm bg-white/20 rounded-lg px-3 py-1 flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                <span>Próxima actualización: {nextUpdate}s</span>
              </div>
              <div className="text-sm mt-1">
                Última actualización: {lastUpdate.toLocaleString('es-AR')}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta de Compra */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 transition-all hover:shadow-xl border-l-4 border-blue-600">
            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Compra</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="animate-pulse">-</span>
                ) : (
                  formatCurrency(rate?.compra || null)
                )}
              </span>
              {rate?.variacionCompra && (
                <span className={`ml-4 text-sm ${getVariationColor(rate.variacionCompra)}`}>
                  {getVariationIcon(rate.variacionCompra)}
                  <span className="ml-1">{formatVariation(rate.variacionCompra)}</span>
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              Precio al que los compradores de dólar MEP adquieren la divisa
            </p>
          </div>
          
          {/* Tarjeta de Venta */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 transition-all hover:shadow-xl border-l-4 border-green-600">
            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Venta</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="animate-pulse">-</span>
                ) : (
                  formatCurrency(rate?.venta || null)
                )}
              </span>
              {rate?.variacionVenta && (
                <span className={`ml-4 text-sm ${getVariationColor(rate.variacionVenta)}`}>
                  {getVariationIcon(rate.variacionVenta)}
                  <span className="ml-1">{formatVariation(rate.variacionVenta)}</span>
                </span>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              Precio al que puedes comprar dólares a través de bonos en el mercado legal
            </p>
          </div>
          
          {/* Tarjeta de Spread/Brecha */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 transition-all hover:shadow-xl border-l-4 border-purple-600">
            <h2 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">Spread</h2>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {loading ? (
                  <span className="animate-pulse">-</span>
                ) : (
                  spread !== null ? `${spread.toFixed(2)}%` : '-'
                )}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
              Diferencia porcentual entre el precio de compra y venta
            </p>
          </div>
        </div>
        
        {/* Comparativas con otros tipos de dólar */}
        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6 flex items-center">
            <Info className="h-5 w-5 mr-2 text-blue-500" />
            Comparación con otros tipos de dólar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/dolar-oficial" className="block group">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Dólar Oficial</h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Tipo de cambio regulado por el Banco Central</p>
              </div>
            </Link>
            
            <Link to="/dolar-blue" className="block group">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Dólar Blue</h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cotización del mercado informal/paralelo</p>
              </div>
            </Link>
            
            <Link to="/latam" className="block group">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Dólar Latam</h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Comparativa con tipos de cambio en otros países</p>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Información detallada del Dólar MEP - Optimizada para SEO */}
        <article className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6" id="info-dolar-blue">
            Guía Completa sobre el Dólar MEP en Argentina
          </h2>
          <div className="prose prose-blue max-w-none dark:prose-invert">
            <h3>¿Qué es el Dólar MEP?</h3>
            <p>
              El <strong>Dólar MEP</strong> (Mercado Electrónico de Pagos), también conocido como <strong>Dólar Bolsa</strong>, 
              es una forma legal de adquirir dólares a través de la compra y venta de bonos o acciones en el mercado de valores argentino. 
              Es una alternativa al dólar oficial que permite operar sin las restricciones del cepo cambiario vigente.
            </p>

            <h3>Características del Dólar MEP</h3>
            <ul>
              <li><strong>Operación 100% legal:</strong> A diferencia del mercado paralelo, está completamente regulado</li>
              <li><strong>Sin límites de compra:</strong> No tiene el tope mensual del dólar oficial</li>
              <li><strong>Requiere cuenta comitente:</strong> Se necesita abrir una cuenta en un broker o agente de bolsa</li>
              <li><strong>Plazo de estacionamiento:</strong> Exige esperar un plazo determinado (actualmente 24 horas hábiles) entre operaciones</li>
              <li><strong>Costos de comisión:</strong> Los brokers cobran comisiones por las operaciones realizadas</li>
            </ul>

            <h3>¿Cómo funciona el Dólar MEP?</h3>
            <p>
              El procedimiento para comprar dólares MEP consiste en:
            </p>
            <ol>
              <li><strong>Abrir una cuenta comitente:</strong> En un banco que opere en bolsa o en un broker</li>
              <li><strong>Transferir pesos:</strong> Enviar el dinero en pesos a la cuenta comitente</li>
              <li><strong>Comprar bonos en pesos:</strong> Adquirir un bono que cotice en pesos (ej. AL30)</li>
              <li><strong>Esperar el plazo:</strong> Cumplir con el "parking" o período de estacionamiento (1 día hábil)</li>
              <li><strong>Vender los bonos en dólares:</strong> Vender los mismos bonos pero con liquidación en dólares (ej. AL30D)</li>
              <li><strong>Retirar los dólares:</strong> Transferirlos a una cuenta bancaria en dólares</li>
            </ol>

            <h3>Ventajas del Dólar MEP</h3>
            <ul>
              <li><strong>Seguridad jurídica:</strong> Al ser una operación legal, no existen riesgos de tipo legal</li>
              <li><strong>Mejor cotización:</strong> Generalmente ofrece un tipo de cambio más favorable que el oficial</li>
              <li><strong>Sin restricciones de montos:</strong> Permite operar con las cantidades que se deseen</li>
              <li><strong>Trazabilidad:</strong> Al ser una operación formal, el origen y destino de los fondos está documentado</li>
              <li><strong>Facilidad para invertir:</strong> Los dólares pueden quedarse en la cuenta comitente para inversiones</li>
            </ul>

            <h3>Consideraciones importantes</h3>
            <p>
              Al operar con Dólar MEP, ten en cuenta:
            </p>
            <ul>
              <li><strong>Comisiones:</strong> El costo final incluye las comisiones del broker (generalmente entre 0.5% y 1%)</li>
              <li><strong>Volatilidad de bonos:</strong> El precio puede variar durante el período de estacionamiento</li>
              <li><strong>Restricciones cruzadas:</strong> Si compraste dólar oficial en los últimos 90 días, no podrás operar dólar MEP</li>
              <li><strong>Restricciones para beneficiarios:</strong> Quienes recibieron ciertos subsidios estatales pueden tener limitaciones</li>
              <li><strong>Cambios regulatorios:</strong> Las normativas pueden modificarse, afectando el proceso o los costos</li>
            </ul>

            <h3>Diferencias con otros tipos de dólar</h3>
            <p>
              El Dólar MEP se distingue del <Link to="/dolar-oficial" className="text-primary hover:text-primary/90 font-medium">dólar oficial</Link>, que está sujeto a restricciones de cantidad y recargos impositivos, 
              y del <Link to="/dolar-blue" className="text-primary hover:text-primary/90 font-medium">dólar blue</Link>, que opera en el mercado informal sin respaldo legal. 
              Su cotización suele ubicarse entre ambos, ofreciendo una alternativa equilibrada entre accesibilidad y legalidad.
            </p>

            <h3>¿Quiénes pueden operar con Dólar MEP?</h3>
            <p>
              Pueden operar personas físicas y jurídicas que no se encuentren dentro de las restricciones establecidas por el Banco Central. 
              No pueden acceder aquellos que hayan adquirido dólar oficial en los últimos 90 días, beneficiarios de tarifas sociales energéticas 
              o financieras, funcionarios públicos de alto rango, entre otros casos específicos regulados por las normativas vigentes.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
