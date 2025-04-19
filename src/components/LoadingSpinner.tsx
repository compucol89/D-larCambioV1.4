import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * Componente de spinner de carga para usar como fallback durante lazy loading
 */
export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full min-h-[60vh]">
      <RefreshCw className="h-10 w-10 animate-spin text-primary dark:text-blue-400" />
      <p className="mt-4 text-gray-600 dark:text-gray-300">Cargando...</p>
    </div>
  );
}
