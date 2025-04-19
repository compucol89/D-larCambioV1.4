import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, DollarSign } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { Link } from 'react-router-dom';
import { fetchWithRetry } from '../services/utils';
import { motion } from 'framer-motion';
import DollarCard from '../components/DollarCard';

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

export function ZelleDollar() {
  const [rate, setRate] = useState<Rate | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'diario'>('diario');
  const [loading, setLoading] = useState(true);
  const [dailyRateData, setDailyRateData] = useState<HistoricalDataPoint[]>([]);

  useEffect(() => {
    const fetchZelleDollar = async () => {
      try {
        setLoading(true);
        const response = await fetchWithRetry('https://dolarapi.com/v1/dolares/blue');
        if (!response.ok) throw new Error('Error al obtener datos');
        const data = await response.json();
        setRate({
          casa: 'zelle',
          nombre: 'Zelle',
          compra: data.compra ? data.compra * 0.93 : null,
          venta: data.venta ? data.venta * 0.93 : null,
          fechaActualizacion: data.fechaActualizacion
        });
        
        // Calculate daily variation data
        if (data && data.compra !== null && data.venta !== null) {
          const average = (data.compra * 0.93 + data.venta * 0.93) / 2;
          const now = new Date();
          const formattedTime = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          setDailyRateData(prevData => {
            const newData = [...prevData, { fecha: formattedTime, compra: data.compra * 0.93, venta: data.venta * 0.93, promedio: average }];
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

    fetchZelleDollar();
    const interval = setInterval(fetchZelleDollar, 60000); // Actualizar cada minuto
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
        title="Dólar Zelle en Argentina - Cotización y Funcionamiento"
        description="Información sobre el uso del dólar Zelle en Argentina. Cómo funciona, ventajas, limitaciones y su impacto en el mercado de divisas."
        path="/dolar-zelle"
      />
      <Header lastUpdate={rate ? new Date(rate.fechaActualizacion) : new Date()} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Todo sobre el Dólar Zelle en Argentina
            </h2>
            <div className="prose prose-blue dark:prose-invert max-w-none">
              <p>
                El "dólar Zelle" se ha convertido en una alternativa popular para realizar pagos y transferencias en dólares de manera rápida y directa, especialmente en países como Argentina donde las restricciones cambiarias y la informalidad financiera son comunes. Esta modalidad aprovecha la plataforma de pagos digitales Zelle, utilizada principalmente en Estados Unidos, para facilitar transacciones en divisas extranjeras. En este artículo, exploraremos qué es el dólar Zelle, cómo funciona, su impacto y las ventajas que ofrece en un contexto económico complejo.
              </p>

              <h3>¿Qué es el Dólar Zelle?</h3>
              <p>
                El término "dólar Zelle" se refiere a las transacciones realizadas en dólares a través de la plataforma Zelle, un sistema de pagos digitales ampliamente utilizado en Estados Unidos. Zelle permite transferencias de dinero entre cuentas bancarias de manera instantánea y sin costo para los usuarios, siempre que ambas cuentas pertenezcan a bancos afiliados al sistema.
              </p>
              <p>
                En Argentina, este método ha ganado popularidad como una forma de recibir pagos en dólares o realizar transferencias internacionales, evitando las limitaciones del sistema financiero local.
              </p>

              <h3>¿Cómo Funciona el Dólar Zelle?</h3>
              <p>Para operar con dólares Zelle, es necesario:</p>
              <ul>
                <li><strong>Tener una cuenta bancaria en Estados Unidos:</strong> Zelle está vinculado a bancos norteamericanos, por lo que se requiere una cuenta en una institución que ofrezca este servicio.</li>
                <li><strong>Configurar Zelle:</strong> Los usuarios deben activar la función Zelle a través de la aplicación móvil de su banco o mediante la plataforma de Zelle.</li>
                <li><strong>Realizar transacciones:</strong> Una vez activado, es posible enviar y recibir dinero en dólares utilizando el correo electrónico o el número de teléfono del destinatario.</li>
              </ul>

              <h3>Ventajas del Dólar Zelle</h3>
              <p>El uso de Zelle en Argentina ofrece diversas ventajas, entre las que destacan:</p>
              <ul>
                <li><strong>Rapidez:</strong> Las transferencias son instantáneas, permitiendo acceso inmediato a los fondos.</li>
                <li><strong>Sin costos adicionales:</strong> No se aplican comisiones por el uso de Zelle, lo que lo hace más económico que otros sistemas de transferencia.</li>
                <li><strong>Facilidad de uso:</strong> Su interfaz sencilla permite realizar operaciones con pocos clics.</li>
                <li><strong>Acceso a dólares:</strong> Es una opción efectiva para manejar divisas extranjeras sin pasar por mercados informales.</li>
              </ul>

              <h3>Impacto del Dólar Zelle en Argentina</h3>
              <p>En un contexto de restricciones cambiarias y control de capitales, el dólar Zelle ha surgido como una alternativa viable para:</p>
              <ul>
                <li><strong>Pagos internacionales:</strong> Facilita la compra de bienes y servicios en el exterior.</li>
                <li><strong>Remesas familiares:</strong> Permite enviar dinero a familiares o amigos en dólares de forma rápida.</li>
                <li><strong>Alternativa al dólar blue:</strong> Aunque no reemplaza al mercado paralelo, brinda una opción formal para manejar divisas.</li>
              </ul>

              <h3>Limitaciones del Dólar Zelle</h3>
              <p>Pese a sus beneficios, el uso de Zelle también presenta algunas limitaciones:</p>
              <ul>
                <li><strong>Requiere cuenta bancaria en Estados Unidos:</strong> No todos los argentinos tienen acceso a este tipo de cuentas.</li>
                <li><strong>Dependencia de terceros:</strong> Muchos usuarios recurren a intermediarios para operar con Zelle, lo que puede generar costos adicionales o riesgos.</li>
                <li><strong>Uso limitado dentro del país:</strong> Aunque es útil para transacciones internacionales, su aplicación local es reducida.</li>
              </ul>

              <h3>Comparación con Otros Tipos de Cambio</h3>
              <p>
                El dólar Zelle se diferencia del <Link to="/dolar-blue" className="text-primary hover:text-primary/90">dólar blue</Link>, el <Link to="/dolar-oficial" className="text-primary hover:text-primary/90">oficial</Link> y el <Link to="/dolar-mep" className="text-primary hover:text-primary/90">MEP</Link> en que no depende de la cotización oficial del Banco Central ni de la oferta y demanda en el mercado informal. Su valor está determinado por las condiciones del mercado estadounidense y, en muchos casos, refleja el precio acordado entre las partes.
              </p>

              <h3>Futuro del Dólar Zelle en Argentina</h3>
              <p>A medida que crece la adopción de tecnologías financieras y las restricciones cambiarias persisten, es probable que el dólar Zelle siga ganando popularidad. Su futuro dependerá de:</p>
              <ul>
                <li><strong>Políticas cambiarias:</strong> Cambios en las regulaciones podrían afectar su uso.</li>
                <li><strong>Acceso a cuentas extranjeras:</strong> Si se facilita el acceso a cuentas en el exterior, más argentinos podrán beneficiarse de esta herramienta.</li>
                <li><strong>Innovación tecnológica:</strong> El desarrollo de plataformas similares podría ofrecer nuevas opciones para manejar divisas.</li>
              </ul>

              <h3>Conclusión</h3>
              <p>
                El dólar Zelle representa una solución ágil, económica y legal para manejar dólares en un contexto desafiante como el argentino. Aunque tiene ciertas limitaciones, su facilidad de uso y accesibilidad lo convierten en una herramienta valiosa para quienes buscan alternativas seguras y eficientes en el manejo de divisas.
              </p>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
