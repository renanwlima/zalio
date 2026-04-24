import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import './App.css';

function AppLayout() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Diz ao aplicativo nativo (iOS/Android) para expandir e cobrir a área da bateria/notch
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setOverlaysWebView({ overlay: true });
        StatusBar.setStyle({ style: theme === 'dark' ? Style.Dark : Style.Light });
      } catch (err) {
        console.log('StatusBar plugin não encontrado.', err);
      }
    }
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));

  // Verifica se está rodando de forma nativa (Android/iOS) para alterar o layout
  const nativeClass = Capacitor.isNativePlatform() ? 'native-mobile-app' : '';

  return (
    <div className={`app-layout ${nativeClass}`}>
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      <main className="main-content">
        {/* Restaura o context para que o Dashboard consiga acessar o 'theme' novamente */}
        <Outlet context={{ theme, toggleTheme }} />
      </main>
      <Footer />
    </div>
  );
}
export default AppLayout;