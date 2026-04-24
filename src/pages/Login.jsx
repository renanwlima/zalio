import { useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth0 } from '@auth0/auth0-react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export default function Login(){
  const { loginWithRedirect, isAuthenticated, isLoading, handleRedirectCallback } = useAuth0(); 
  const navigate = useNavigate();

  useEffect(() => {
    // Efeito para garantir que a tela de login respeite o tema (escuro/claro) do usuário
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    // Se o usuário chegar na página de login mas já estiver autenticado,
    // o redirecionamos para a página inicial.
    // O `isLoading` garante que só fazemos isso após o Auth0 terminar a verificação.
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Escuta o retorno do Auth0 no aplicativo (Deep Link) via Capacitor
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = CapApp.addListener('appUrlOpen', async ({ url }) => {
        // Se a URL for de retorno do Logout (não tem o parâmetro "state=" de login)
        if (url.includes('com.zalio.app/callback') && !url.includes('state=')) {
          // Apenas fecha o navegador nativo silenciosamente
          await Browser.close().catch(() => {});
          return;
        }
        // Verifica se a URL de retorno tem os parâmetros de sucesso ou erro do Auth0
        if (url.includes('state=') && (url.includes('error=') || url.includes('code='))) {
          // Fecha o navegador nativo (Custom Tab) que estava sobreposto
          await Browser.close().catch(() => {});
          try {
            // Passa a URL para o Auth0 processar o login e gerar o token da sessão
            await handleRedirectCallback(url);
          } catch (error) {
            console.error('Erro no Auth0:', error);
            alert('Erro ao finalizar o login: ' + error.message);
          }
        }
      });
      return () => {
        listener.then(l => l.remove());
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async () => {
    await loginWithRedirect({
      async openUrl(url) {
        // Se for celular, usa o navegador nativo interno (melhor UX e evita abrir o Chrome)
        if (Capacitor.isNativePlatform()) {
          await Browser.open({ url });
        } else {
          // Se for PC, redireciona a página normalmente
          window.location.assign(url);
        }
      }
    });
  };

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
            <button onClick={handleLogin} style={{ padding: '1rem', fontSize: '1.1rem' }}>
              Entrar ou Registrar
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
