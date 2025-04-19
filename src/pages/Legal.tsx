import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export function Legal() {
  const lastUpdate = new Date();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEOHead
        title="Información Legal"
        description="Información legal y avisos importantes sobre el uso de DolarCambio.com. Derechos, responsabilidades y limitaciones."
        path="/legal"
      />
      <Header lastUpdate={lastUpdate} />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Información Legal - DolarCambio.com
          </h1>
          
          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <p className="text-gray-600 mb-6">
                En DolarCambio.com, nuestra misión es proporcionar información clara, accesible y actualizada sobre las cotizaciones del dólar blue y otros tipos de cambio en Argentina. Sin embargo, es importante destacar que toda la información publicada en este sitio tiene un carácter meramente informativo y orientativo, y está destinada únicamente como referencia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Naturaleza Informativa del Sitio
              </h2>
              <p className="text-gray-600 mb-4">
                DolarCambio.com no brinda asesoramiento, consejo, recomendación ni invitación de ningún tipo para realizar operaciones, transacciones financieras, decisiones económicas, comerciales o legales.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Las cotizaciones, gráficos y cuadros mostrados en este sitio están basados en datos de fuentes públicas de acceso libre.</li>
                <li>Esta información no pretende sustituir el asesoramiento profesional y debe ser utilizada con precaución.</li>
              </ul>
              <p className="text-gray-600">
                Te invitamos a visitar nuestra sección de{' '}
                <Link to="/terminos" className="text-primary hover:text-primary/90">
                  Términos y Condiciones
                </Link>{' '}
                para obtener detalles completos sobre nuestras políticas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Limitación de Responsabilidad
              </h2>
              <p className="text-gray-600 mb-4">
                El titular de DolarCambio.com no garantiza la precisión, exactitud, veracidad, integridad ni vigencia de los datos publicados en este sitio.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Las decisiones que se tomen con base en la información aquí presentada son responsabilidad exclusiva del usuario.</li>
                <li>DolarCambio.com deslinda toda responsabilidad por posibles daños, perjuicios o pérdidas patrimoniales derivados del uso o mal uso de los datos publicados.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Propiedad Intelectual
              </h2>
              <p className="text-gray-600 mb-4">
                Todos los contenidos publicados en DolarCambio.com, incluyendo gráficos, cuadros y textos, están protegidos por la Ley N.º 11.723 de Propiedad Intelectual de la República Argentina.
              </p>
              <p className="text-gray-600">
                Está prohibida la reproducción, distribución, transmisión o uso no autorizado de los contenidos sin el consentimiento previo y por escrito de los titulares del sitio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Relación con Anunciantes
              </h2>
              <p className="text-gray-600 mb-4">
                Los titulares de DolarCambio.com no mantienen acuerdos, alianzas o vínculos comerciales con los anunciantes que publicitan sus productos o servicios en este sitio, salvo por la locación de espacios publicitarios.
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>El contenido de los banners y piezas publicitarias es de exclusiva responsabilidad de los anunciantes.</li>
                <li>DolarCambio.com no garantiza la veracidad ni la exactitud de dichos contenidos.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Advertencias Legales y Cumplimiento Normativo
              </h2>
              <p className="text-gray-600 mb-4">
                Este sitio opera en conformidad con las leyes vigentes de la República Argentina, incluyendo:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>
                  <strong>Ley de Defensa del Consumidor (Ley N.º 24.240):</strong> Todos los datos publicados tienen un carácter referencial y no constituyen una oferta de productos o servicios financieros.
                </li>
                <li>
                  <strong>Ley de Protección de los Datos Personales (Ley N.º 25.326):</strong> En caso de recopilarse información personal de los usuarios, esta será tratada con estricta confidencialidad.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Compromiso con la Transparencia
              </h2>
              <p className="text-gray-600 mb-4">
                En DolarCambio.com, creemos en la importancia de proporcionar información confiable y relevante. Sin embargo, el dinamismo del mercado y las fluctuaciones constantes hacen que los valores publicados deban tomarse siempre como orientativos.
              </p>
              <p className="text-gray-600">
                Te invitamos a consultar diariamente{' '}
                <Link to="/" className="text-primary hover:text-primary/90">
                  DolarCambio.com
                </Link>{' '}
                para acceder a datos actualizados y confiables sobre el dólar blue, las tendencias del mercado y las cotizaciones más relevantes en Argentina.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Actualización de Términos
              </h2>
              <p className="text-gray-600 mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento, sin previo aviso. El uso continuo de este sitio implica la aceptación de estas condiciones.
              </p>
              <p className="text-gray-600">
                Para más información, no dudes en visitar nuestra sección de{' '}
                <Link to="/terminos" className="text-primary hover:text-primary/90">
                  Términos y Condiciones
                </Link>{' '}
                o ponerte en contacto con nosotros.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
