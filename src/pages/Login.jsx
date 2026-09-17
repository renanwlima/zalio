import { useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth0 } from '@auth0/auth0-react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { IconLock } from '../components/Icons';

export default function Login(){
  const { loginWithRedirect, isAuthenticated, isLoading, handleRedirectCallback } = useAuth0(); 
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const listener = CapApp.addListener('appUrlOpen', async ({ url }) => {
        if (url.includes('com.rwl.zalio/callback') && !url.includes('state=')) {
          await Browser.close().catch(() => {});
          return;
        }
        if (url.includes('state=') && (url.includes('error=') || url.includes('code='))) {
          await Browser.close().catch(() => {});
          try {
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
  }, [handleRedirectCallback]);

  const handleLogin = async () => {
    await loginWithRedirect({
      async openUrl(url) {
        if (Capacitor.isNativePlatform()) {
          await Browser.open({ url });
        } else {
          window.location.assign(url);
        }
      }
    });
  };

  return (
    <div className="app-layout" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(ellipse at top, var(--bg-subtle) 0%, var(--bg-color) 70%)' }}>
      <main className="container-focused" aria-labelledby="ttlLogin" style={{ textAlign: 'center', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1.6rem',
          boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)'
        }}>
          Z
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
          Zalio Financeiro
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.9rem' }}>
          Gestão e controle financeiro pessoal moderno e inteligente.
        </p>

        <button 
          onClick={handleLogin} 
          className="btn-primary"
          style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
        >
          Entrar ou Criar Conta
        </button>

        <div style={{ marginTop: '1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          <IconLock size={14} color="var(--text-muted)" />
          <span>Autenticação segura via Auth0</span>
        </div>
      </main>
    </div>
  );
}
