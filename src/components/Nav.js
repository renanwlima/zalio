import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

// Função para obter o tema salvo ou o padrão do sistema
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export default function Nav() {
  const { logout } = useAuth0();
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        Zalio
      </NavLink>
      <button onClick={toggleTheme} className="theme-btn">
        Mudar para {theme === 'light' ? 'Escuro' : 'Claro'}
      </button>
      <button
        className="nav-btn-primary"
        onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/login' } })}
      >
        Sair
      </button>
    </nav>
  );
}