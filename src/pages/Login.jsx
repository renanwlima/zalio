import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function Login(){
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const nav = useNavigate();

  // Efeito para redirecionar para a Home (Dashboard) caso o usuário já esteja logado
  useEffect(() => {
    // Efeito para garantir que a tela de login respeite o tema (escuro/claro) do usuário
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      nav('/');
    }
  }, [isAuthenticated, nav]);

  if (isLoading) {
    return (
      <div className="app-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Carregando validação...</div>
      </div>
    );
  }

  // Como o Auth0 usa o "Universal Login", substituímos o formulário local 
  // por um botão que redireciona o usuário para o ambiente seguro do Auth0.
  return (
    <div className="app-layout">
      <div className="main-content" style={{ justifyContent: 'center', padding: '1rem' }}>
        <main className="container" aria-labelledby="ttlLogin" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h1 className="nav-logo" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'inline-block' }}>Zalio</h1>
          <h2 id="ttlLogin" style={{ margin: '1rem 0' }}>Bem-vindo</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
            Faça login ou crie sua conta de forma segura.
          </p>
          <div className="grid">
            <button onClick={() => loginWithRedirect()} style={{ padding: '1rem', fontSize: '1.1rem' }}>
              Acessar com Auth0
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
