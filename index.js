import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      {/*Envolvemos o App.js com BrowserRouter para habilitar o uso do NavLink e o roteamento em toda a aplicação
        A falta do BrowserRouter irá gerar o seguinte erro:
     1 - Uncaught Error: useLocation() may be used only in the context of a <Router> component.
        Visualizar com F12 no navegador
      */}
     <BrowserRouter>
       <App />
     </BrowserRouter>
  </React.StrictMode>
);
