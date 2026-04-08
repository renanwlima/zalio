import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIAS } from '../services/storage';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';

export default function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth0(); // Pega as informações do usuário logado no Auth0
  const { carregarTudo } = useData();
  // Recupera a transação caso esteja no modo "Editar"
  const transacaoEditada = location.state?.transaction;

  const [form, setForm] = useState({
    descricao: transacaoEditada?.descricao || '',
    valor: transacaoEditada?.valor || '',
    categoria: transacaoEditada?.categoria || CATEGORIAS[0],
    data: transacaoEditada?.date || new Date().toISOString().split('T')[0] // Permite data retroativa
  });

  const handleChange = useCallback((e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;

    const payload = {
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      date: form.data,
      tipo: 'saida',
      user_id: user?.sub // Atrela esta saída ao usuário que está logado
    };

    const { error } = transacaoEditada //
      ? await supabase.from('transactions').update(payload).eq('id', transacaoEditada.id) //
      : await supabase.from('transactions').insert([payload]); //

    if (error) {
      console.error('Erro no Supabase:', error);
      alert('Erro ao salvar o gasto: ' + error.message);
      return;
    }
    carregarTudo(); // Atualiza o cache global
    navigate('/'); // Volta para o Dashboard
  }, [form, transacaoEditada, navigate, user?.sub, carregarTudo]);

  return (
    <main className="container">
      <h2>{transacaoEditada ? 'Editar Gasto' : 'Adicionar Gasto'}</h2>
      <form onSubmit={handleSubmit} className="grid">
        <label>Descrição</label>
        <input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Ex: Mercado, Uber..." required />
        
        <label>Valor (R$)</label>
        <input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} placeholder="0,00" required />
        
        <label>Categoria</label>
        <select name="categoria" value={form.categoria} onChange={handleChange} className="input-field">
          {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <label>Data</label>
        <input name="data" type="date" value={form.data} onChange={handleChange} required />

        <button type="submit">{transacaoEditada ? 'Atualizar Gasto' : 'Salvar Gasto'}</button>
      </form>
    </main>
  );
}