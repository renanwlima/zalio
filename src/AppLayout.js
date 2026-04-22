import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
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
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));

  return (
    <div className="app-layout">
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