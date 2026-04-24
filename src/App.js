import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { App as CapacitorApp } from '@capacitor/app';
import './App.css';

// Componente de Loader global
const Loader = () => (
  <div className="loader-container">
    <div className="loader"></div>
    <p>Verificando sessão...</p>
  </div>
);

function App() {
  const { isLoading, isAuthenticated, error, handleRedirectCallback } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Escuta a URL de retorno que o Android enviou
    const listener = CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
      // Verifica se a URL é a resposta do Auth0
      if (url.includes('state=') && (url.includes('code=') || url.includes('error='))) {
        try {
          await handleRedirectCallback(url);
        } catch (error) {
          console.error("Erro ao processar o login:", error);
        }
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [handleRedirectCallback]);

  useEffect(() => {
    // Se o Auth0 terminou de carregar e o usuário NÃO está autenticado,
    // o enviamos para a nossa página de login customizada.
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (error) {
    return <div>Oops... Algo deu errado: {error.message}</div>;
  }

  // Mostra um loader global enquanto o Auth0 verifica a sessão.
  if (isLoading) {
    return <Loader />;
  }

  // Se o usuário estiver autenticado, renderiza o Outlet, que por sua vez renderizará o AppLayout.
  return isAuthenticated ? <Outlet /> : <Loader />;
}
export default App;
