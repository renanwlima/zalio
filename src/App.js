import { Outlet } from 'react-router-dom';
import NavBar from './components/NavBar';
import './App.css';
import { useState, useEffect } from 'react';

function App() {
  // O estado verifica primeiro se há algo salvo. Se não, pergunta para o sistema operacional!
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Verifica se o celular/navegador está no tema escuro
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Sempre que o tema mudar, salva no localStorage e aplica o CSS
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listener para acompanhar mudanças no tema do sistema operacional em tempo real
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme((curr) => (curr === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-layout">
      {/* A NavBar é necessária para que a barra de navegação seja exibida em todas as páginas da aplicação, permitindo que os usuários naveguem facilmente entre as diferentes seções do site. */}
      {/* Sem a NavBar, os usuários teriam dificuldade em acessar outras páginas da aplicação, o que poderia resultar em uma experiência de usuário ruim e dificultar a navegação. */}
      {/* A NavBar é uma parte fundamental do layout da aplicação, proporcionando uma maneira intuitiva e acessível para os usuários explorarem o conteúdo do site. */}
      <NavBar theme={theme} toggleTheme={toggleTheme} />
      {/* Resto do conteúdo da página */}
      {/* O Outlet é onde os componentes filhos serão renderizados */}
      {/* Ele é necessário para que as rotas filhas sejam exibidas dentro do layout do App */}
      {/* Sem o Outlet, as rotas filhas não seriam renderizadas, e você não veria o conteúdo das páginas correspondentes às rotas */}
      {/* O Outlet é uma parte fundamental do sistema de roteamento do React Router, permitindo que você crie layouts reutilizáveis e organize suas rotas de forma hierárquica */}
      {/* Ele é especialmente útil quando você tem um layout comum para várias páginas, como um cabeçalho ou uma barra de navegação, e deseja renderizar o conteúdo específico de cada página dentro desse layout */}
      {/* Em resumo, o Outlet é essencial para que as rotas filhas sejam renderizadas corretamente dentro do layout do App, garantindo que o conteúdo das páginas seja exibido conforme esperado. */}
      <div className="main-content">
        <Outlet context={{ theme, toggleTheme }} />
      </div>

      <footer className="footer" style={{ padding: '0.5rem', fontSize: '0.85rem', lineHeight: '1.2', textAlign: 'center' }}>
        <p style={{ margin: '0.1rem 0' }}>Desenvolvido por <strong>Renan Willian</strong></p>
        <p className="footer-role" style={{ margin: '0.1rem 0' }}>Analista e Desenvolvedor de Software</p>
        <p className="footer-copy" style={{ margin: '0.1rem 0', fontSize: '0.75rem', opacity: 0.8 }}>&copy; {new Date().getFullYear()} Zalio. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
export default App;
