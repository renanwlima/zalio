import { Link, NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useState } from 'react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { 
  IconSun, 
  IconMoon, 
  IconClose, 
  IconWallet, 
  IconPiggyBank, 
  IconCalendar, 
  IconCreditCard, 
  IconPlus, 
  IconMinus 
} from './Icons';

export default function NavBar({ theme, toggleTheme }) {
  const { logout, user, isAuthenticated } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = async () => {
    if (Capacitor.isNativePlatform()) {
      logout({
        logoutParams: { returnTo: 'com.rwl.zalio://dev-7tf743azyjk8acdg.us.auth0.com/capacitor/com.rwl.zalio/callback' },
        async openUrl(url) {
          await Browser.open({ url });
        }
      });
    } else {
      const returnUrl = window.location.hostname.includes('github.io') 
        ? 'https://renanwlima.github.io/zalio/' 
        : window.location.origin;
      logout({ logoutParams: { returnTo: returnUrl } });
    }
  };

  const userName = user?.given_name || user?.name?.split(' ')[0] || user?.nickname || 'Usuário';
  const userPicture = user?.picture;

  return (
    <>
      <style>
        {`
          .modern-navbar {
            position: sticky;
            top: 0;
            z-index: 100;
            height: var(--navbar-height);
            background: ${theme === 'dark' ? 'rgba(14, 20, 32, 0.92)' : 'rgba(255, 255, 255, 0.92)'};
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-color);
            transition: background-color 0.2s ease, border-color 0.2s ease;
            display: flex;
            align-items: center;
          }

          .navbar-inner {
            max-width: 1440px;
            width: 100%;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: ${Capacitor.isNativePlatform() ? 'calc(0.5rem + env(safe-area-inset-top, 0px)) 1.5rem 0.5rem' : '0 1.75rem'};
            gap: 1.5rem;
          }

          .brand-logo {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            text-decoration: none;
            color: var(--text-main);
          }

          .brand-symbol {
            width: 32px;
            height: 32px;
            border-radius: 9px;
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 800;
            font-size: 1.05rem;
            box-shadow: 0 3px 8px rgba(37, 99, 235, 0.3);
          }

          .brand-text {
            font-size: 1.35rem;
            font-weight: 800;
            letter-spacing: -0.03em;
            background: linear-gradient(135deg, var(--text-main) 30%, var(--primary-color) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .nav-links-desktop {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)'};
            padding: 0.25rem;
            border-radius: 9999px;
            border: 1px solid var(--border-color);
          }

          .nav-item {
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-secondary);
            padding: 0.4rem 0.9rem;
            border-radius: 9999px;
            transition: all 0.15s ease;
            white-space: nowrap;
          }

          .nav-item:hover {
            color: var(--text-main);
            background: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)'};
          }

          .nav-item.active {
            color: var(--primary-color);
            background: var(--card-bg);
            box-shadow: var(--shadow-sm);
          }

          .navbar-actions {
            display: flex;
            align-items: center;
            gap: 0.65rem;
          }

          .user-profile-badge {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.25rem 0.65rem 0.25rem 0.35rem;
            border-radius: 9999px;
            background: var(--bg-subtle);
            border: 1px solid var(--border-color);
            font-size: 0.825rem;
            font-weight: 600;
            color: var(--text-main);
          }

          .user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
            background: var(--primary-color);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
          }

          .nav-icon-btn {
            background: var(--bg-subtle);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            width: 34px;
            height: 34px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            transition: all 0.15s ease;
          }

          .nav-icon-btn:hover {
            background: var(--card-bg);
            border-color: var(--primary-color);
          }

          .nav-logout-btn {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--error-color);
            padding: 0.35rem 0.75rem;
            border-radius: 7px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .nav-logout-btn:hover {
            background: var(--error-light);
            border-color: var(--error-color);
          }

          .hamburger-btn {
            display: none;
            background: var(--bg-subtle);
            border: 1px solid var(--border-color);
            color: var(--text-main);
            width: 36px;
            height: 36px;
            border-radius: 8px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          /* Mobile Side Drawer */
          .mobile-drawer-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 200;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
          }

          .mobile-drawer-overlay.open {
            opacity: 1;
            pointer-events: auto;
          }

          .mobile-drawer {
            position: fixed;
            top: 0;
            right: -300px;
            width: 290px;
            height: 100%;
            background: var(--card-bg);
            border-left: 1px solid var(--border-color);
            box-shadow: var(--shadow-xl);
            z-index: 210;
            display: flex;
            flex-direction: column;
            padding: 1.5rem;
            gap: 1.25rem;
            transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .mobile-drawer.open {
            right: 0;
          }

          .drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
          }

          .drawer-links {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            overflow-y: auto;
          }

          .drawer-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-sm);
            text-decoration: none;
            color: var(--text-secondary);
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.15s ease;
          }

          .drawer-item:hover, .drawer-item.active {
            color: var(--primary-color);
            background: var(--primary-light);
          }

          @media (max-width: 1080px) {
            .nav-links-desktop, .user-profile-badge, .nav-logout-btn {
              display: none;
            }
            .hamburger-btn {
              display: flex;
            }
          }

          @media (max-width: 768px) {
            .navbar-inner {
              padding: 0 1rem;
              gap: 0.75rem;
            }
          }
        `}
      </style>

      <header className="modern-navbar no-print">
        <div className="navbar-inner">
          {/* Logo & Marca */}
          <Link to="/" className="brand-logo" aria-label="Zalio Financeiro">
            <div className="brand-symbol">Z</div>
            <span className="brand-text">Zalio</span>
          </Link>

          {/* Links Centrais no Desktop */}
          <nav className="nav-links-desktop" aria-label="Navegação Principal">
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/cofrinho" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Cofrinhos
            </NavLink>
            <NavLink to="/despesas-fixas" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Despesas Fixas
            </NavLink>
            <NavLink to="/historico" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Histórico
            </NavLink>
            <NavLink to="/dados" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Dados
            </NavLink>
          </nav>

          {/* Ações da Direita */}
          <div className="navbar-actions">
            {isAuthenticated && (
              <div className="user-profile-badge" title={user?.name || user?.email}>
                {userPicture ? (
                  <img src={userPicture} alt={userName} className="user-avatar" />
                ) : (
                  <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
                )}
                <span>{userName}</span>
              </div>
            )}

            {/* Alternar Tema */}
            <button 
              onClick={toggleTheme} 
              className="nav-icon-btn" 
              title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
              aria-label="Alternar Tema"
            >
              {theme === 'dark' ? <IconSun size={17} /> : <IconMoon size={17} />}
            </button>

            {/* Logout no Desktop */}
            {isAuthenticated && (
              <button onClick={handleLogout} className="nav-logout-btn" title="Sair da Conta">
                Sair
              </button>
            )}

            {/* Hambúrguer Mobile */}
            <button className="hamburger-btn" onClick={toggleMenu} aria-label="Abrir Menu">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Drawer Overlay (Mobile) */}
      <div 
        className={`mobile-drawer-overlay ${isMenuOpen ? 'open' : ''}`} 
        onClick={toggleMenu}
      />

      {/* Drawer Menu (Mobile) */}
      <aside 
        className={`mobile-drawer ${isMenuOpen ? 'open' : ''}`}
        style={{ paddingTop: Capacitor.isNativePlatform() ? 'calc(1.5rem + env(safe-area-inset-top, 0px))' : '1.5rem' }}
      >
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-symbol" style={{ width: '28px', height: '28px', fontSize: '0.95rem' }}>Z</div>
            <span className="brand-text" style={{ fontSize: '1.2rem' }}>Zalio</span>
          </div>
          <button 
            onClick={toggleMenu} 
            className="nav-icon-btn" 
            style={{ width: '32px', height: '32px' }}
            aria-label="Fechar Menu"
          >
            <IconClose size={16} />
          </button>
        </div>

        {isAuthenticated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
            {userPicture ? (
              <img src={userPicture} alt={userName} className="user-avatar" style={{ width: '36px', height: '36px' }} />
            ) : (
              <div className="user-avatar" style={{ width: '36px', height: '36px', fontSize: '1rem' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{userName}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
            </div>
          </div>
        )}

        <div className="drawer-links">
          <NavLink to="/" end className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            <IconWallet size={18} /> Dashboard
          </NavLink>
          <NavLink to="/adicionar-entrada" className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            <IconPlus size={18} /> Nova Entrada
          </NavLink>
          <NavLink to="/adicionar-saida" className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            <IconMinus size={18} /> Novo Gasto
          </NavLink>
          <NavLink to="/cofrinho" className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            <IconPiggyBank size={18} /> Cofrinhos
          </NavLink>
          <NavLink to="/despesas-fixas" className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            <IconCalendar size={18} /> Despesas Fixas
          </NavLink>
          <NavLink to="/historico" className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            <IconCreditCard size={18} /> Histórico
          </NavLink>
          <NavLink to="/dados" className={({ isActive }) => `drawer-item ${isActive ? 'active' : ''}`} onClick={toggleMenu}>
            <IconWallet size={18} /> Meus Dados
          </NavLink>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            onClick={() => { toggleTheme(); toggleMenu(); }} 
            className="btn-secondary" 
            style={{ width: '100%' }}
          >
            {theme === 'dark' ? <><IconSun size={16} /> Modo Claro</> : <><IconMoon size={16} /> Modo Escuro</>}
          </button>
          {isAuthenticated && (
            <button 
              onClick={handleLogout} 
              className="btn-danger" 
              style={{ width: '100%' }}
            >
              Sair da Conta
            </button>
          )}
        </div>
      </aside>
    </>
  );
}