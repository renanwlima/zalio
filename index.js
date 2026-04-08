import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      {/*Envolvemos o App.js com BrowserRouter para habilitar o uso do NavLink e o roteamento em toda a aplicação
        A falta do BrowserRouter irá gerar o seguinte erro:
     1 - Uncaught Error: useLocation() may be used only in the context of a <Router> component.
        Visualizar com F12 no navegador
      */}
     <Auth0Provider
       domain="dev-7tf743azyjk8acdg.us.auth0.com"
       clientId="0iQvuP6ljEvDIMKlO8dUKujViEe2HvKk"
       authorizationParams={{
         redirect_uri: window.location.origin
       }}
     >
       <BrowserRouter>
         <App />
       </BrowserRouter>
     </Auth0Provider>
  </React.StrictMode>
);
