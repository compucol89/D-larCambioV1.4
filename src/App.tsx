import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { useTheme } from './hooks/useTheme';

// Importación lazy de componentes de página
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Terms = lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));
const Legal = lazy(() => import('./pages/Legal').then(module => ({ default: module.Legal })));
const Privacy = lazy(() => import('./pages/Privacy').then(module => ({ default: module.Privacy })));
const BlueDollar = lazy(() => import('./pages/BlueDollar').then(module => ({ default: module.BlueDollar })));
const OfficialDollar = lazy(() => import('./pages/OfficialDollar').then(module => ({ default: module.OfficialDollar })));
const MepDollar = lazy(() => import('./pages/MepDollar').then(module => ({ default: module.MepDollar })));
const LatamDollar = lazy(() => import('./pages/LatamDollar').then(module => ({ default: module.LatamDollar })));
const ZelleDollar = lazy(() => import('./pages/ZelleDollar').then(module => ({ default: module.ZelleDollar })));
const Remesas = lazy(() => import('./pages/Remesas').then(module => ({ default: module.Remesas })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

const history = createMemoryHistory();

// Wrapper para el Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <SuspenseWrapper><Home /></SuspenseWrapper>,
  },
  {
    path: "/terminos",
    element: <SuspenseWrapper><Terms /></SuspenseWrapper>,
  },
  {
    path: "/legal",
    element: <SuspenseWrapper><Legal /></SuspenseWrapper>,
  },
  {
    path: "/privacidad",
    element: <SuspenseWrapper><Privacy /></SuspenseWrapper>,
  },
  {
    path: "/dolar-blue",
    element: <SuspenseWrapper><BlueDollar /></SuspenseWrapper>,
  },
  {
    path: "/dolar-oficial",
    element: <SuspenseWrapper><OfficialDollar /></SuspenseWrapper>,
  },
  {
    path: "/dolar-mep",
    element: <SuspenseWrapper><MepDollar /></SuspenseWrapper>,
  },
  {
    path: "/latam",
    element: <SuspenseWrapper><LatamDollar /></SuspenseWrapper>,
  },
  {
    path: "/dolar-zelle",
    element: <SuspenseWrapper><ZelleDollar /></SuspenseWrapper>,
  },
  {
    path: "/remesas",
    element: <SuspenseWrapper><Remesas /></SuspenseWrapper>,
  },
  {
    path: "*",
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>,
  }
],
{
  future: {
    v7_startTransition: true
  }
});

function App() {
  const { theme, setTheme } = useTheme();

  // Función para configurar el tema según la hora en Argentina
  useEffect(() => {
    // Configurar la función para que se ejecute inicialmente y luego cada minuto
    const updateThemeBasedOnTime = () => {
      // Obtener la hora actual en Argentina (GMT-3)
      const now = new Date();
      
      // Ajustar a la hora de Argentina
      const argentinaTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      // Ajustar a GMT-3 (Argentina)
      argentinaTime.setHours(argentinaTime.getHours() - 3 + now.getTimezoneOffset() / 60);
      
      const hours = argentinaTime.getHours();
      
      // Modo oscuro de 19:00 a 7:00, modo claro de 7:00 a 19:00
      const shouldBeDarkMode = hours < 7 || hours >= 19;
      
      // Cambiar el tema solo si es necesario
      if (shouldBeDarkMode && theme !== 'dark') {
        setTheme('dark');
      } else if (!shouldBeDarkMode && theme !== 'light') {
        setTheme('light');
      }
    };
    
    // Ejecutar inmediatamente
    updateThemeBasedOnTime();
    
    // Configurar un intervalo para actualizar el tema cada minuto
    const intervalId = setInterval(updateThemeBasedOnTime, 60000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(intervalId);
  }, [theme, setTheme]);

  return (
    <div className={theme}>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <Toaster position="bottom-center" />
      </div>
    </div>
  );
}

export default App;
