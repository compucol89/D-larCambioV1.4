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

export function BlueDollar() {
  const [rate, setRate] = useState<Rate | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextUpdate, setNextUpdate] = useState(60);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchBlueDollar = async () => {
      try {
        setLoading(true);
        const response = await fetchWithRetry('https://dolarapi.com/v1/dolares/blue');
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

    fetchBlueDollar();
    const interval = setInterval(fetchBlueDollar, 60000); // Actualizar cada minuto
    
    // Contador regresivo para próxima actualización
    const timer = setInterval(() => {
      setNextUpdate(prev => (prev > 0 ? prev - 1 : 60));
    }, 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'No disponible';
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatVariation = (variation: number | null) => {
    if (variation === null) return '';
    return `${variation > 0 ? '+' : ''}${variation.toFixed(2)}%`;
  };

  const getVariationColor = (variation: number | null) => {
    if (variation === null) return 'text-gray-500';
    if (variation > 0) return 'text-green-500 dark:text-green-400';
    if (variation < 0) return 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getVariationIcon = (variation: number | null) => {
    if (variation === null) return <ArrowRight className="h-4 w-4" />;
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
        title="Dólar Blue Hoy | Cotización Actualizada en Tiempo Real | Argentina"
        description="Cotización actualizada al minuto del dólar blue en Argentina. Precio de compra y venta, variaciones diarias, histórico y comparativas con otras divisas. Información oficial para tomar mejores decisiones financieras."
        path="/dolar-blue"
      />
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado principal con datos destacados */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <DollarSign className="h-8 w-8 mr-2" />
                Dólar Blue Hoy
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
              Precio al que los compradores de dólar blue adquieren la divisa
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
              Precio al que puedes comprar dólares en el mercado paralelo
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
            
            <Link to="/dolar-mep" className="block group">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Dólar MEP/Bolsa</h3>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cotización legal obtenida a través de bonos</p>
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
        
        {/* Información detallada del Dólar Blue - Optimizada para SEO */}
        <article className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6" id="info-dolar-blue">
            Guía Completa sobre el Dólar Blue en Argentina
          </h2>
          <div className="prose prose-blue max-w-none dark:prose-invert">
            <h3>¿Qué es el Dólar Blue?</h3>
            <p>
              El <strong>dólar blue</strong> es el nombre que recibe el dólar estadounidense en el mercado paralelo o informal en Argentina. 
              Este mercado surge como respuesta a las restricciones cambiarias ("cepo cambiario") implementadas por el gobierno argentino, 
              que limitan la compra oficial de divisas extranjeras. Su cotización fluctúa libremente según la oferta y demanda, sin regulación estatal.
            </p>

            <h3>Diferencias entre el Dólar Blue y otros tipos de dólar</h3>
            <p>
              A diferencia del <Link to="/dolar-oficial" className="text-primary hover:text-primary/90 font-medium">dólar oficial</Link>, cuyo valor es regulado por el Banco Central de la República Argentina (BCRA), 
              el dólar blue refleja el valor real de mercado. También existe el <Link to="/dolar-mep" className="text-primary hover:text-primary/90 font-medium">dólar MEP o Bolsa</Link>, 
              una alternativa legal para adquirir dólares a través de operaciones bursátiles.
            </p>

            <h3>Factores que influyen en la cotización del Dólar Blue</h3>
            <ul>
              <li><strong>Política monetaria:</strong> Las decisiones del Banco Central sobre emisión de moneda y tasas de interés</li>
              <li><strong>Reservas internacionales:</strong> El nivel de reservas en dólares del país</li>
              <li><strong>Inflación:</strong> Altas tasas de inflación generan mayor demanda de dólares como refugio de valor</li>
              <li><strong>Restricciones cambiarias:</strong> Mayor severidad del cepo cambiario suele aumentar la brecha con el dólar oficial</li>
              <li><strong>Eventos económicos y políticos:</strong> Anuncios gubernamentales, elecciones y crisis económicas</li>
            </ul>

            <h3>Importancia económica del Dólar Blue</h3>
            <p>
              El dólar blue funciona como un termómetro de la economía argentina y tiene importantes implicaciones:
            </p>
            <ul>
              <li><strong>Referencia de precios:</strong> Muchos bienes y servicios se fijan tomando esta cotización como referencia</li>
              <li><strong>Ahorro e inversión:</strong> Los argentinos utilizan el dólar blue como reserva de valor frente a la inflación</li>
              <li><strong>Brecha cambiaria:</strong> La diferencia entre el dólar oficial y el blue refleja la tensión económica y las expectativas del mercado</li>
              <li><strong>Comercio exterior:</strong> Afecta indirectamente a importaciones y exportaciones</li>
            </ul>

            <h3>Evolución histórica del Dólar Blue en Argentina</h3>
            <p>
              El mercado paralelo del dólar no es un fenómeno nuevo en Argentina, pero el término "blue" ganó popularidad desde 2011,
              cuando se implementaron controles cambiarios durante el gobierno de Cristina Fernández de Kirchner. Desde entonces, 
              la brecha entre el dólar oficial y el blue ha sido un indicador clave de la estabilidad económica del país.
            </p>
            
            <p>
              En 2020, con el endurecimiento del cepo cambiario, la brecha llegó a superar el 100%. Esta diferencia fluctúa según 
              las políticas económicas, la confianza de los mercados y la situación macroeconómica del país.
            </p>

            <h3>¿Dónde se compra y vende el Dólar Blue?</h3>
            <p>
              Las operaciones con dólar blue se realizan principalmente en:
            </p>
            <ul>
              <li><strong>Casas de cambio informales:</strong> Conocidas popularmente como "cuevas"</li>
              <li><strong>Arbolitos:</strong> Personas que operan en zonas céntricas ofreciendo cambio de divisas</li>
              <li><strong>Redes informales:</strong> Contactos personales y redes de confianza</li>
            </ul>
            <p>
              Es importante destacar que estas operaciones no están reguladas oficialmente, por lo que conllevan riesgos legales y 
              de seguridad que cada persona debe evaluar.
            </p>

            <h3>Perspectivas futuras</h3>
            <p>
              El futuro del dólar blue está estrechamente vinculado a las políticas económicas y monetarias que implemente el gobierno argentino. 
              La reducción de la brecha cambiaria dependerá de factores como el control de la inflación, el aumento de las reservas internacionales,
              y la generación de confianza en los mercados financieros internacionales.
            </p>
            
            <p>
              La experiencia histórica muestra que las soluciones sostenibles requieren equilibrio fiscal, estabilidad monetaria y un marco 
              regulatorio predecible que genere confianza tanto en el mercado local como internacional.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
