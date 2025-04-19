import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
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

interface HistoricalDataPoint {
  fecha: string;
  compra: number | null;
  venta: number | null;
  promedio: number | null;
}

export function OfficialDollar() {
  const [rate, setRate] = useState<Rate | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'diario'>('diario');
  const [loading, setLoading] = useState(true);
  const [dailyRateData, setDailyRateData] = useState<HistoricalDataPoint[]>([]);

  useEffect(() => {
    const fetchOfficialDollar = async () => {
      try {
        setLoading(true);
        const response = await fetchWithRetry('https://dolarapi.com/v1/dolares/oficial');
        if (!response.ok) throw new Error('Error al obtener datos');
        const data = await response.json();
        setRate(data);
        
        // Calculate daily variation data
        if (data && data.compra !== null && data.venta !== null) {
          const average = (data.compra + data.venta) / 2;
          const now = new Date();
          const formattedTime = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          setDailyRateData(prevData => {
            const newData = [...prevData, { fecha: formattedTime, compra: data.compra, venta: data.venta, promedio: average }];
            if (newData.length > 7) {
              newData.shift();
            }
            return newData;
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficialDollar();
    const interval = setInterval(fetchOfficialDollar, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatVariation = (variation: number) => {
    return `${variation > 0 ? '+' : ''}${variation.toFixed(2)}%`;
  };

  const getVariationColor = (variation: number) => {
    if (variation > 0) return 'text-green-500';
    if (variation < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="h-4 w-4" />;
    if (variation < 0) return <TrendingDown className="h-4 w-4" />;
    return <ArrowRight className="h-4 w-4" />;
  };

  const totalVariation = 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <SEOHead
        title="Dólar Oficial - Cotización del Banco Nación"
        description="Cotización oficial del dólar en Argentina según el Banco Nación. Precio de compra y venta, variaciones diarias y evolución histórica."
        path="/dolar-oficial"
      />
      <Header lastUpdate={rate ? new Date(rate.fechaActualizacion) : new Date()} />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
          {/* Gráfico de variaciones */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Valores del día
              </h2>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dailyRateData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                  />
                  <YAxis
                    stroke="#6B7280"
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: '#F3F4F6'
                    }}
                    formatter={(value: number, name: string) => {
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="compra"
                    name="Compra"
                    stroke="#1e40af"
                    strokeWidth={2}
                    dot={{ fill: '#1e40af', r: 4 }}
                    activeDot={{ r: 6, fill: '#3b82f6' }}
                  />
                   <Line
                    type="monotone"
                    dataKey="venta"
                    name="Venta"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6, fill: '#34d399' }}
                  />
                   <Line
                    type="monotone"
                    dataKey="promedio"
                    name="Promedio"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6, fill: '#facc15' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <article className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
            Historia y todo sobre el Dólar Oficial en Argentina
          </h2>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p>
              El "dólar oficial" es la referencia principal para las transacciones internacionales y comerciales en Argentina. Está regulado directamente por el Banco Central de la República Argentina (BCRA) y su cotización tiene un impacto crucial en la economía del país. Este artículo explora la historia, la regulación y los efectos del dólar oficial, así como su relación con el dólar blue y otros tipos de cambio.
            </p>

            <h3>Qué es el Dólar Oficial</h3>
            <p>
              El dólar oficial es la tasa de cambio establecida por el Banco Central para las operaciones reguladas dentro del sistema financiero argentino. Es utilizado en:
            </p>
            <ul>
              <li>Importaciones y exportaciones.</li>
              <li>Compra de bienes y servicios internacionales.</li>
              <li>Operaciones financieras oficiales.</li>
            </ul>
            <p>
              El valor del dólar oficial es controlado mediante políticas monetarias y fiscales, y se diferencia del <Link to="/dolar-blue" className="text-primary hover:text-primary/90">dólar blue</Link> por su naturaleza regulada y legal.
            </p>

            <h3>Historia del Dólar Oficial en Argentina</h3>
            <p>
              El dólar oficial ha tenido una historia marcada por las fluctuaciones y las crisis económicas del país. Algunos momentos clave incluyen:
            </p>
            <ul>
              <li><strong>Conversión de 1 a 1 (1991-2001):</strong> Durante la convertibilidad, el peso argentino estuvo atado al dólar estadounidense a una tasa fija de 1 a 1, lo que trajo estabilidad inicial pero terminó en una profunda crisis económica.</li>
              <li><strong>Devaluaciones posteriores a 2001:</strong> Tras la salida de la convertibilidad, el peso comenzó a depreciarse frente al dólar, marcando el inicio de un sistema de cambio más flexible.</li>
              <li><strong>Cepo cambiario (2011):</strong> Se implementaron restricciones para acceder al mercado oficial, generando una mayor brecha con el mercado paralelo.</li>
              <li><strong>Cambios en la política cambiaria (2015 y 2019):</strong> Los gobiernos de Mauricio Macri y Alberto Fernández adoptaron enfoques distintos, desde la liberación del tipo de cambio hasta la reimplementación del cepo.</li>
            </ul>

            <h3>Cómo se Determina el Valor del Dólar Oficial</h3>
            <p>El Banco Central regula el valor del dólar oficial mediante:</p>
            <ul>
              <li><strong>Intervenciones en el mercado cambiario:</strong> Compra y venta de divisas para mantener la estabilidad.</li>
              <li><strong>Control de la oferta y demanda:</strong> Regulando las operaciones de compra de dólares para individuos y empresas.</li>
              <li><strong>Políticas monetarias:</strong> Ajustando la tasa de interés y otras medidas macroeconómicas.</li>
            </ul>

            <h3>Relación con el Dólar Blue</h3>
            <p>
              El dólar oficial y el dólar blue reflejan dos caras de la misma moneda. Mientras el primero representa el mercado formal y regulado, el segundo es una alternativa informal utilizada para sortear restricciones. La brecha entre ambos tipos de cambio es un indicador de las tensiones económicas y la desconfianza en el sistema oficial.
            </p>

            <h3>Impacto del Dólar Oficial en la Economía</h3>
            <p>El valor del dólar oficial influye directamente en:</p>
            <ul>
              <li><strong>Inflación:</strong> Un aumento en su cotización impacta los precios de bienes importados y, por ende, la inflación local.</li>
              <li><strong>Comercio exterior:</strong> Determina la competitividad de las exportaciones y el costo de las importaciones.</li>
              <li><strong>Reservas del Banco Central:</strong> El acceso al dólar oficial afecta las reservas internacionales del país.</li>
            </ul>

            <h3>Críticas y Desafíos</h3>
            <p>El sistema del dólar oficial enfrenta diversas críticas:</p>
            <ul>
              <li><strong>Distorsión de precios:</strong> Las diferencias entre el dólar oficial y el blue crean incertidumbre.</li>
              <li><strong>Restricciones cambiarias:</strong> Limitan el acceso de individuos y empresas a divisas extranjeras, incentivando la informalidad.</li>
              <li><strong>Dependencia de las reservas:</strong> La estabilidad del dólar oficial depende de las reservas internacionales, las cuales suelen ser limitadas.</li>
            </ul>

            <h3>El Futuro del Dólar Oficial</h3>
            <p>El futuro del dólar oficial en Argentina estará determinado por:</p>
            <ul>
              <li><strong>Políticas económicas:</strong> La gestión del gobierno en términos de control cambiario y fiscal.</li>
              <li><strong>Condiciones externas:</strong> Factores como los precios de las materias primas y la disponibilidad de crédito internacional.</li>
              <li><strong>Confianza interna:</strong> La percepción de los ciudadanos y los mercados sobre la estabilidad económica del país.</li>
            </ul>

            <h3>Conclusión</h3>
            <p>
              El dólar oficial es un pilar fundamental de la economía argentina. Su historia y dinámica reflejan las complejidades del sistema económico del país. Para los argentinos, comprender su funcionamiento es esencial para adaptarse a los desafíos económicos y financieros del presente y del futuro.
            </p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
