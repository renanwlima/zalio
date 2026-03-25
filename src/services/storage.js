const KEY = 'finance_data_v1';

export const getTransactions = () => {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTransaction = (transaction) => {
  const data = getTransactions();
  // Adiciona o novo item no início da lista
  const newData = [transaction, ...data];
  localStorage.setItem(KEY, JSON.stringify(newData));
};

export const removeTransaction = (id) => {
  const data = getTransactions();
  const newData = data.filter(item => item.id !== id);
  localStorage.setItem(KEY, JSON.stringify(newData));
};

// Categorias fixas para usar no select e gráficos
export const CATEGORIAS = ['Alimentação', 'Transporte', 'Lazer', 'Contas', 'Outros'];

export const CATEGORY_COLORS = {
  'Alimentação': '#10b981', // Emerald
  'Transporte': '#3b82f6',  // Blue
  'Lazer': '#8b5cf6',       // Violet
  'Contas': '#ef4444',      // Red
  'Outros': '#6b7280'       // Gray
};