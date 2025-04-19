import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export function Privacy() {
  const lastUpdate = new Date();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEOHead
        title="Política de Privacidad"
        description="Política de privacidad de DolarCambio.com. Información sobre el tratamiento de datos personales y cookies."
        path="/privacidad"
      />
      <Header lastUpdate={lastUpdate} />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Políticas de Privacidad - DolarCambio.com
          </h1>
          
          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <p className="text-gray-600 mb-6">
                En DolarCambio.com, valoramos y respetamos la privacidad de nuestros usuarios. Este documento establece cómo gestionamos y protegemos la información que proporcionas al utilizar nuestro sitio web. Nuestra prioridad es garantizar que tu experiencia sea segura, personalizada y confiable, mientras accedes a la información más actualizada sobre el dólar blue en Argentina.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                1. Información que recopilamos
              </h2>
              <p className="text-gray-600 mb-4">
                Podemos recopilar información personal de los usuarios que interactúan con nuestro sitio, incluyendo:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Nombre completo.</li>
                <li>Información de contacto (correo electrónico, teléfono, dirección, etc.).</li>
                <li>Información demográfica.</li>
                <li>Datos específicos necesarios para procesar solicitudes.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                2. Uso de la información recopilada
              </h2>
              <p className="text-gray-600 mb-4">
                La información que recopilamos es utilizada para:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Proporcionar contenido personalizado y relevante sobre el dólar blue y otras cotizaciones en tiempo real.</li>
                <li>Mejorar nuestros servicios y adaptarlos a las necesidades de nuestros usuarios.</li>
                <li>Enviar correos electrónicos periódicos con noticias y actualizaciones.</li>
                <li>Garantizar la seguridad y el correcto funcionamiento del sitio web.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                3. Protección de datos personales
              </h2>
              <p className="text-gray-600 mb-4">
                En cumplimiento con la{' '}
                <Link to="/legal" className="text-primary hover:text-primary/90">
                  Ley N.º 25.326 de Protección de los Datos Personales
                </Link>{' '}
                de la República Argentina:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Implementamos medidas de seguridad avanzadas para proteger tus datos.</li>
                <li>Tratamos la información con absoluta confidencialidad.</li>
                <li>Utilizamos los datos solo para los fines específicos indicados.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                4. Uso de cookies
              </h2>
              <p className="text-gray-600 mb-4">
                Nuestro sitio utiliza cookies para:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Analizar el tráfico web y entender cómo interactúas con nuestro contenido.</li>
                <li>Guardar preferencias del usuario para futuras visitas.</li>
                <li>Mejorar la navegabilidad del sitio.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                5. Enlaces a terceros
              </h2>
              <p className="text-gray-600 mb-4">
                DolarCambio.com puede incluir enlaces a sitios web de terceros. Te recomendamos revisar las políticas de privacidad de cada sitio externo antes de proporcionar cualquier información.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                6. Control de tu información personal
              </h2>
              <p className="text-gray-600 mb-4">
                Como usuario, tienes derecho a:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Acceder a tus datos personales.</li>
                <li>Solicitar la rectificación o eliminación de tus datos.</li>
                <li>Oponerte al tratamiento de tu información.</li>
                <li>Revocar el consentimiento previamente otorgado.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                7. Cambios en las Políticas de Privacidad
              </h2>
              <p className="text-gray-600 mb-4">
                Nos reservamos el derecho de actualizar estas políticas en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en esta página.
              </p>
              <p className="text-gray-600">
                Para más información sobre nuestras prácticas legales, te invitamos a consultar nuestra{' '}
                <Link to="/legal" className="text-primary hover:text-primary/90">
                  Información Legal
                </Link>{' '}
                y{' '}
                <Link to="/terminos" className="text-primary hover:text-primary/90">
                  Términos y Condiciones
                </Link>.
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
