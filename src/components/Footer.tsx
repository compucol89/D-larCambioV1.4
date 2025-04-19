import React from 'react';
import { DollarSign, Globe2, TrendingUp, Github, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">
              Sobre el sitio
            </h3>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">
              DolarCambio.com te brinda información actualizada sobre las cotizaciones del dólar en Argentina y Latinoamérica.
              Datos en tiempo real para mantenerte informado.
            </p>
            <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm">
              Para conocer más detalles sobre las limitaciones y responsabilidades asociadas al uso de este sitio, 
              te invitamos a revisar nuestra sección de{' '}
              <Link to="/terminos" className="text-primary dark:text-yellow-500 hover:text-primary/90 dark:hover:text-yellow-400 font-medium">
                Términos y Condiciones
              </Link>.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">
              Cotizaciones
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/dolar-blue" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm group">
                  <DollarSign className="h-4 w-4 group-hover:text-primary dark:group-hover:text-yellow-500" />
                  Dólar Blue
                </Link>
              </li>
              <li>
                <Link to="/dolar-oficial" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm group">
                  <DollarSign className="h-4 w-4 group-hover:text-primary dark:group-hover:text-yellow-500" />
                  Dólar Oficial
                </Link>
              </li>
              <li>
                <Link to="/dolar-mep" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm group">
                  <TrendingUp className="h-4 w-4 group-hover:text-primary dark:group-hover:text-yellow-500" />
                  Dólar MEP
                </Link>
              </li>
              <li>
                <Link to="/latam" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm group">
                  <Globe2 className="h-4 w-4 group-hover:text-primary dark:group-hover:text-yellow-500" />
                  Dólar Latam
                </Link>
              </li>
              <li>
                <Link to="/dolar-zelle" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm group">
                  <DollarSign className="h-4 w-4 group-hover:text-primary dark:group-hover:text-yellow-500" />
                  Dólar Zelle
                </Link>
              </li>
               <li>
                <Link to="/remesas" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm group">
                  <DollarSign className="h-4 w-4 group-hover:text-primary dark:group-hover:text-yellow-500" />
                  Remesas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white uppercase tracking-wider">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/terminos" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm">
                  Información Legal
                </Link>
              </li>
              <li>
                <Link to="/privacidad" className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-yellow-500 text-sm">
                  Políticas de Privacidad
                </Link>
              </li>
            </ul>

            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Actualización automática cada minuto
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Código optimizado para rendimiento
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">
            © {new Date().getFullYear()} DolarCambio.com. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
