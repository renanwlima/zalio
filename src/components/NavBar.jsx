import { Link, NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';

export default function NavBar({ theme, toggleTheme }) {
  const { logout, user, isAuthenticated } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Função para aplicar a cor azul e negrito apenas na aba que estiver ativa
  const activeStyle = ({ isActive }) => ({
    color: isActive ? '#3b82f6' : '',
    textShadow: isActive ? '0.4px 0 0 #3b82f6' : 'none', // Simula o negrito sem alargar as letras
    textDecoration: 'none'
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <style>
        {`
          .nav-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1.5rem;
            padding: 1rem;
            width: 100%;
            box-sizing: border-box;
            position: relative;
          }
          .nav-desktop-links {
            display: flex;
            gap: 1.5rem;
            align-items: center;
          }
          .nav-desktop-right {
            position: absolute;
            right: 2rem;
            display: flex;
            gap: 1rem;
            align-items: center;
          }
          .hamburger-btn {
            display: none;
            background: none;
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            width: auto;
            padding: 0 0.5rem 0 0;
            margin: 0;
            box-shadow: none;
          }
          .side-menu {
            position: fixed;
            top: 0;
            left: -250px;
            width: 250px;
            height: 100%;
            background-color: ${theme === 'dark' ? '#1e1e1e' : '#ffffff'};
            box-shadow: 2px 0 5px rgba(0,0,0,0.3);
            transition: left 0.3s ease;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            padding: 2rem 1.5rem;
            gap: 1.2rem;
          }
          .side-menu.open {
            left: 0;
          }
          .side-menu a {
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            text-decoration: none;
            font-size: 1.1rem;
          }
          .side-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
          }
          .side-menu-overlay.open {
            display: block;
          }
          .close-btn {
            align-self: flex-end;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            margin-bottom: 1rem;
          }
          
          /* Container do Logo para facilitar a movimentação */
          .logo-container {
            position: absolute;
            left: 2rem;
            display: flex;
            align-items: center;
          }

          /* Quando a tela for menor que 768px (dispositivos móveis) */
          @media (max-width: 768px) {
            .nav-desktop-links, .nav-desktop-right {
              display: none;
            }
            .nav-container {
              justify-content: space-between;
              flex-direction: row-reverse; /* Inverte a ordem no celular: Menu na esquerda, Logo na direita */
              padding: 0.8rem 1rem;
            }
            .hamburger-btn {
              display: block;
            }
            .logo-container {
              position: static; /* Permite que o flexbox posicione a logo na direita */
            }
          }
        `}
      </style>

      <nav className="nav nav-container">
        {/* Logo */}
        <div className="logo-container">
          <Link to="/" className="nav-logo" style={{ fontSize: '1.8rem', fontWeight: 'bold', textDecoration: 'none' }}>Zalio</Link>
        </div>
        
        {/* Botão Hambúrguer (Apenas Mobile) */}
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Abrir Menu">
          ☰
        </button>

        {/* Links de navegação centrais (Desktop) */}
        <div className="nav-desktop-links">
          <NavLink to="/" end style={activeStyle}>Dashboard</NavLink>
          <NavLink to="/cofrinho" style={activeStyle}>Cofrinhos</NavLink>
          <NavLink to="/adicionar-entrada" style={activeStyle}>Entradas</NavLink>
          <NavLink to="/adicionar-saida" style={activeStyle}>Saídas</NavLink>
          <NavLink to="/despesas-fixas" style={activeStyle}>Despesas Fixas</NavLink>
          <NavLink to="/historico" style={activeStyle}>Histórico</NavLink>
          <NavLink to="/dados" style={activeStyle}>Dados</NavLink>
        </div>

        {/* Direita: Saudação e Botões (Desktop) */}
        <div className="nav-desktop-right">
          {/* Saudação */}
          {isAuthenticated && user && (
            <span style={{ color: 'var(--text-secondary, #666)', fontSize: '0.95rem' }}>
              Olá, <strong style={{ color: 'var(--text-color, inherit)' }}>{user.given_name || user.name?.split(' ')[0] || user.nickname || 'Usuário'}</strong>!
            </span>
          )}

          {/* Botão de Sair */}
          <button 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            style={{
              margin: 0,
              background: 'transparent',
              color: 'var(--error-color, red)',
              border: '1px solid var(--error-color, red)',
              padding: '0.5rem 1rem',
              width: 'auto',
              boxShadow: 'none'
            }}
          >
            Sair
          </button>

          {/* Botão de Tema */}
          <button onClick={toggleTheme} className="theme-btn" aria-label="Alternar Tema" style={{ margin: 0 }}>
            {theme === 'light' ? '🌙 Escuro' : '☀️ Claro'}
          </button>
        </div>
      </nav>

      {/* Overlay para fechar o menu ao clicar fora */}
      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}></div>

      {/* Menu Lateral (Mobile) */}
      <div className={`side-menu ${isMenuOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleMenu} aria-label="Fechar Menu">✕</button>
        
        {isAuthenticated && user && (
          <span style={{ color: 'var(--text-secondary, #666)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            Olá, <strong style={{ color: 'var(--text-color, inherit)' }}>{user.given_name || user.name?.split(' ')[0] || user.nickname || 'Usuário'}</strong>!
          </span>
        )}

        <NavLink to="/" end style={activeStyle} onClick={toggleMenu}>Dashboard</NavLink>
        <NavLink to="/cofrinho" style={activeStyle} onClick={toggleMenu}>Cofrinhos</NavLink>
        <NavLink to="/adicionar-entrada" style={activeStyle} onClick={toggleMenu}>Entradas</NavLink>
        <NavLink to="/adicionar-saida" style={activeStyle} onClick={toggleMenu}>Saídas</NavLink>
        <NavLink to="/despesas-fixas" style={activeStyle} onClick={toggleMenu}>Despesas Fixas</NavLink>
        <NavLink to="/historico" style={activeStyle} onClick={toggleMenu}>Histórico</NavLink>
        <NavLink to="/dados" style={activeStyle} onClick={toggleMenu}>Dados</NavLink>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
          <button onClick={() => { toggleTheme(); toggleMenu(); }} className="theme-btn" aria-label="Alternar Tema" style={{ width: '100%', margin: 0 }}>
            {theme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro'}
          </button>

          <button 
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            style={{
              margin: 0,
              background: 'transparent',
              color: 'var(--error-color, red)',
              border: '1px solid var(--error-color, red)',
              padding: '0.5rem 1rem',
              width: '100%',
              boxShadow: 'none'
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </>
  );
}