import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';

export function Terms() {
  const lastUpdate = new Date();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEOHead
        title="Términos y Condiciones"
        description="Términos y condiciones de uso de DolarCambio.com. Información legal sobre el uso del sitio y sus servicios."
        path="/terminos"
      />
      <Header lastUpdate={lastUpdate} />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Términos y Condiciones de Uso - DolarCambio.com
          </h1>
          
          <div className="prose prose-blue max-w-none">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                1. Naturaleza Informativa del Sitio
              </h2>
              <p className="text-gray-600 mb-4">
                DolarCambio.com ® es un sitio web de carácter exclusivamente informativo. No constituye consejo, recomendación, 
                asesoramiento, invitación, ni incitación de ningún tipo para realizar actos, decisiones u operaciones 
                financieras, económicas, comerciales, legales o de cualquier otra índole.
              </p>
              <p className="text-gray-600 mb-4">
                Para más detalles sobre el carácter informativo de nuestro sitio, te invitamos a consultar nuestra{' '}
                <Link to="/legal" className="text-primary hover:text-primary/90">
                  Información Legal
                </Link>.
              </p>
              <p className="text-gray-600 mb-8">
                Las cotizaciones, cuadros, gráficos y demás datos presentados en este sitio son elaborados sobre la base 
                de información pública de acceso libre y gratuito. La información proporcionada no tiene fines comerciales 
                ni pretende sustituir el asesoramiento profesional.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                2. Propiedad Intelectual
              </h2>
              <p className="text-gray-600 mb-8">
                Los contenidos, cuadros y gráficos mostrados en este sitio constituyen propiedad intelectual amparada 
                por la Ley N.º 11.723 de Propiedad Intelectual de la República Argentina. Está prohibida la reproducción, 
                distribución, transmisión, almacenamiento o uso no autorizado de los contenidos sin el consentimiento 
                expreso y por escrito de los titulares del sitio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                3. Limitación de Responsabilidad sobre la Información
              </h2>
              <p className="text-gray-600 mb-4">
                Los titulares de DolarCambio.com no garantizan la precisión, veracidad, exactitud, integridad o vigencia 
                de los datos mostrados en el sitio. Para más detalles sobre nuestras responsabilidades y limitaciones, 
                consulta nuestra{' '}
                <Link to="/legal" className="text-primary hover:text-primary/90">
                  Información Legal
                </Link>.
              </p>
              <p className="text-gray-600 mb-4">
                En relación con la información presentada:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                <li>Las fuentes utilizadas son de acceso público y se citan de manera explícita cuando corresponde.</li>
                <li>Los titulares del sitio no se hacen responsables por posibles errores, omisiones o desactualizaciones en los datos.</li>
                <li>El uso de la información contenida en este sitio es de exclusiva responsabilidad del usuario.</li>
                <li>DolarCambio.com no se responsabiliza por los eventuales daños patrimoniales, pérdidas económicas o perjuicios que pudieran derivarse de decisiones tomadas en base a los datos publicados en este sitio.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                4. Relación con Anunciantes y Publicidad
              </h2>
              <p className="text-gray-600 mb-8">
                Los titulares de DolarCambio.com no mantienen vínculos comerciales, contractuales o de asociación con los 
                anunciantes que publicitan sus productos o servicios en este sitio, salvo la locación de espacios publicitarios.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                5. Protección de Datos Personales
              </h2>
              <p className="text-gray-600 mb-4">
                La protección de tus datos personales es una prioridad para nosotros. Toda la información recopilada 
                se maneja de acuerdo con nuestra{' '}
                <Link to="/privacidad" className="text-primary hover:text-primary/90">
                  Política de Privacidad
                </Link>, que establece:
              </p>
              <ul className="list-disc pl-6 mb-8 text-gray-600 space-y-2">
                <li>Qué información recopilamos y cómo la utilizamos</li>
                <li>Medidas de seguridad implementadas</li>
                <li>Tus derechos como usuario</li>
                <li>Uso de cookies y tecnologías similares</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                6. Advertencias Legales Adicionales
              </h2>
              <p className="text-gray-600 mb-8">
                Este sitio opera de acuerdo con las leyes vigentes de la República Argentina, incluyendo la Ley de Defensa 
                del Consumidor (Ley N.º 24.240) y la Ley de Protección de los Datos Personales (Ley N.º 25.326). Para más 
                información sobre el marco legal de nuestras operaciones, consulta nuestra{' '}
                <Link to="/legal" className="text-primary hover:text-primary/90">
                  Información Legal
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                7. Actualización de los Términos y Condiciones
              </h2>
              <p className="text-gray-600 mb-4">
                Los presentes términos y condiciones podrán ser actualizados o modificados en cualquier momento sin previo 
                aviso. Los usuarios del sitio aceptan estas condiciones al acceder y utilizar el contenido ofrecido en{' '}
                <Link to="/" className="text-primary hover:text-primary/90">
                  DolarCambio.com
                </Link>.
              </p>
              <p className="text-gray-600 mb-8">
                Te recomendamos revisar periódicamente esta página para estar al tanto de cualquier cambio.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                Contacto
              </h2>
              <p className="text-gray-600 mb-8">
                Para consultas o solicitudes relacionadas con el uso del sitio, por favor contáctanos a través de nuestro 
                correo electrónico: <a href="mailto:info@dolarcambio.com" className="text-primary hover:text-primary/90">info@dolarcambio.com</a>
              </p>
            </section>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
