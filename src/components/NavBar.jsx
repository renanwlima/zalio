import { Link, NavLink } from 'react-router-dom';

export default function NavBar({ theme, toggleTheme }) {
  // Função para aplicar a cor azul e negrito apenas na aba que estiver ativa
  const activeStyle = ({ isActive }) => ({
    color: isActive ? '#3b82f6' : '',
    textShadow: isActive ? '0.4px 0 0 #3b82f6' : 'none' // Simula o negrito sem alargar as letras
  });

  return (
    <nav className="nav" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', padding: '1rem', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
      {/* Logo ou Título do projeto à esquerda */}
      <Link to="/" className="nav-logo" style={{ position: 'absolute', left: '2rem', fontSize: '1.8rem', fontWeight: 'bold', textDecoration: 'none' }}>Zalio</Link>
      
      {/* Links de navegação centrais */}
      <NavLink to="/" end style={activeStyle}>Dashboard</NavLink>
      <NavLink to="/cofrinho" style={activeStyle}>Cofrinhos</NavLink>
      <NavLink to="/adicionar-entrada" style={activeStyle}>Adicionar Entrada</NavLink>
      <NavLink to="/adicionar-saida" style={activeStyle}>Adicionar Saída</NavLink>
      <NavLink to="/despesas-fixas" style={activeStyle}>Despesas Fixas</NavLink>
      <NavLink to="/historico" style={activeStyle}>Histórico</NavLink>
      <NavLink to="/dados" style={activeStyle}>Dados</NavLink>

      {/* Botão de Tema */}
      <button onClick={toggleTheme} className="theme-btn" aria-label="Alternar Tema" style={{ position: 'absolute', right: '2rem' }}>
        {theme === 'light' ? '🌙 Escuro' : '☀️ Claro'}
      </button>
    </nav>
  );
}