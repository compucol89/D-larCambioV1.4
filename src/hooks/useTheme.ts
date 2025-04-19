import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark'); // Inicializar en 'dark'

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Función para establecer el tema directamente
  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };

  return { theme, toggleTheme, setTheme };
}
