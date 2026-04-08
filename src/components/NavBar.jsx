import { Link, NavLink } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function NavBar({ theme, toggleTheme }) {
  const { logout, user, isAuthenticated } = useAuth0();
  // Função para aplicar a cor azul e negrito apenas na aba que estiver ativa
  const activeStyle = ({ isActive }) => ({
    color: isActive ? '#3b82f6' : '',
    textShadow: isActive ? '0.4px 0 0 #3b82f6' : 'none' // Simula o negrito sem alargar as letras
  });

  return (
    <nav className="nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', padding: '1rem', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      {/* Esquerda: Logo */}
      <div style={{ position: 'absolute', left: '2rem', display: 'flex', alignItems: 'center' }}>
        <Link to="/" className="nav-logo" style={{ fontSize: '1.8rem', fontWeight: 'bold', textDecoration: 'none' }}>Zalio</Link>
      </div>
      
      {/* Links de navegação centrais */}
      <NavLink to="/" end style={activeStyle}>Dashboard</NavLink>
      <NavLink to="/cofrinho" style={activeStyle}>Cofrinhos</NavLink>
      <NavLink to="/adicionar-entrada" style={activeStyle}>Entradas</NavLink>
      <NavLink to="/adicionar-saida" style={activeStyle}>Saídas</NavLink>
      <NavLink to="/despesas-fixas" style={activeStyle}>Despesas Fixas</NavLink>
      <NavLink to="/historico" style={activeStyle}>Histórico</NavLink>
      <NavLink to="/dados" style={activeStyle}>Dados</NavLink>

      {/* Direita: Saudação e Botões */}
      <div style={{ position: 'absolute', right: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Saudação */}
        {isAuthenticated && user && (
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Olá, <strong style={{ color: 'var(--text-color)' }}>{user.given_name || user.name?.split(' ')[0] || user.nickname || 'Usuário'}</strong>!
          </span>
        )}

        {/* Botão de Sair */}
        <button 
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          style={{
            margin: 0,
            background: 'transparent',
            color: 'var(--error-color)',
            border: '1px solid var(--error-color)',
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
  );
}