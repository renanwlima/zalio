import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Auth0Provider } from '@auth0/auth0-react';
import { Capacitor } from '@capacitor/core';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  /*  O React.StrictMode é necessário para ativar verificações adicionais e avisos durante o desenvolvimento, ajudando a identificar problemas potenciais no código e garantindo que a aplicação siga as melhores práticas do React. 
  Ele é uma ferramenta útil para melhorar a qualidade do código e evitar bugs, mas não afeta o comportamento da aplicação em produção. 
  Sem o React.StrictMode, essas verificações adicionais não seriam realizadas, o que poderia resultar em um código menos robusto e mais propenso a erros. */  
  
  <React.StrictMode>
      {/* O RouterProvider é necessário para que as rotas sejam renderizadas corretamente,
        Ele é responsável por fornecer o contexto de roteamento para toda a aplicação, permitindo que as rotas sejam definidas e renderizadas conforme
        especificado no arquivo routes.jsx. Sem o RouterProvider, as rotas não seriam renderizadas, e você não veria o conteúdo das páginas correspondentes às rotas.
        O RouterProvider é uma parte fundamental do sistema de roteamento do React Router, garantindo que as rotas sejam processadas e exibidas corretamente em toda a aplicação.
      */}
     <Auth0Provider
       domain="dev-7tf743azyjk8acdg.us.auth0.com"
       clientId="0iQvuP6ljEvDIMKlO8dUKujViEe2HvKk"
       cacheLocation="localstorage"
       useRefreshTokens={true}
       useCookiesForTransactions={true}
       // O Auth0 precisa de um `redirect_uri` diferente para web e para mobile.
       // `Capacitor.isNativePlatform()` detecta se o app está rodando no Android/iOS.
       authorizationParams={{
         redirect_uri: Capacitor.isNativePlatform()
           ? 'com.zalio.app://dev-7tf743azyjk8acdg.us.auth0.com/capacitor/com.zalio.app/callback'
           : window.location.origin + (window.location.hostname === 'localhost' ? '' : '/zalio')
       }}
     >
       <RouterProvider router={router} />
     </Auth0Provider>
  </React.StrictMode>
);
