import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { SEOHead } from '../components/SEOHead';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col">
      <SEOHead
        title="Página no encontrada"
        description="Lo sentimos, la página que estás buscando no existe o ha sido movida."
        path="/404"
      />
      <Header lastUpdate={new Date()} />
      
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-primary dark:text-blue-400">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mt-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-md">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors mt-6"
          >
            <Home className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
