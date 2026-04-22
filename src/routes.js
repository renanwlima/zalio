import { createHashRouter } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import AppLayout from './AppLayout'; // Nosso novo componente de Layout
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import AddIncome from './pages/AddIncome';
import History from './pages/History';

export const router = createHashRouter([
  {
    // A página de login é uma rota pública, fora do layout principal.
    path: "/login",
    element: <Login />,
  },
  {
    // O componente App agora funciona como um "portão" de autenticação.
    path: "/",
    element: <App />,
    children: [
      // Se o usuário estiver autenticado, o App renderiza um Outlet,
      // que por sua vez renderiza o AppLayout com as páginas protegidas dentro dele.
      { element: <AppLayout />, children: [
        { index: true, element: <Dashboard /> },
        { path: "adicionar-saida", element: <AddExpense /> },
        { path: "adicionar-entrada", element: <AddIncome /> },
        { path: "historico", element: <History /> }
      ]}
    ],
  },
]);