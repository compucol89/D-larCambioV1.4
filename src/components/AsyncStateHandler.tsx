import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface AsyncStateHandlerProps {
  /**
   * Si los datos están cargando actualmente
   */
  loading: boolean;
  
  /**
   * Mensaje de error, si existe
   */
  error: string | null;
  
  /**
   * Función para reintentar la operación
   */
  retry?: () => void;
  
  /**
   * Componente que muestra el estado de carga
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Componente que muestra el contenido cuando está cargado exitosamente
   */
  children: React.ReactNode;
  
  /**
   * Si debe mostrar los children incluso cuando hay error
   */
  showChildrenOnError?: boolean;
}

/**
 * Componente para manejar diferentes estados de operaciones asíncronas
 * Muestra un indicador de carga, mensaje de error, o el contenido principal según el estado
 */
export function AsyncStateHandler({
  loading,
  error,
  retry,
  loadingComponent,
  children,
  showChildrenOnError = true,
}: AsyncStateHandlerProps) {
  // Componente de carga predeterminado
  const defaultLoadingComponent = (
    <div className="flex flex-col items-center justify-center p-8 w-full">
      <RefreshCw className="h-8 w-8 animate-spin text-primary dark:text-blue-400" />
      <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando datos...</p>
    </div>
  );

  // Mostrar el indicador de carga si está cargando
  if (loading) {
    return <>{loadingComponent || defaultLoadingComponent}</>;
  }

  // Mostrar mensaje de error si hay un error visible y no es un error especial
  if (error && error !== '__ABORT__') {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-yellow-700 dark:text-yellow-400 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{error}</p>
              <p className="mt-1 text-sm opacity-90">
                Los datos mostrados podrían estar desactualizados o ser aproximados.
              </p>
              {retry && (
                <button
                  onClick={retry}
                  className="mt-3 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-200 rounded text-sm flex items-center gap-1.5 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reintentar
                </button>
              )}
            </div>
          </div>
        </div>
        {showChildrenOnError && children}
      </div>
    );
  }

  // Mostrar el contenido principal
  return <>{children}</>;
}
