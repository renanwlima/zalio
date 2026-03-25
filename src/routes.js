import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import AddExpense from './pages/AddExpense';
import AddIncome from './pages/AddIncome'; // Criaremos este componente para as Entradas
import History from './pages/History';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "adicionar-saida", element: <AddExpense /> },
      { path: "adicionar-entrada", element: <AddIncome /> },
      { path: "historico", element: <History /> }
    ]
  }
]);