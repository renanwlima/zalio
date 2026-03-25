import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function AddIncome() {
  const navigate = useNavigate();
  const location = useLocation();
  const transacaoEditada = location.state?.transaction;

  const [description, setDescription] = useState(transacaoEditada?.descricao || '');
  const [amount, setAmount] = useState(transacaoEditada?.valor || '');
  const [date, setDate] = useState(transacaoEditada?.date || new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      descricao: description,
      valor: Number(amount),
      date: date,
      tipo: 'entrada'
    };

    const { error } = transacaoEditada 
      ? await supabase.from('transactions').update(payload).eq('id', transacaoEditada.id)
      : await supabase.from('transactions').insert([payload]);

    if (error) {
      console.error('Erro no Supabase:', error);
      alert('Erro ao salvar a entrada: ' + error.message);
      return;
    }

    navigate('/'); // Volta para o Dashboard
  };

  return (
    <div className="container">
      <h2>{transacaoEditada ? 'Editar Entrada' : 'Adicionar Entrada'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <div>
            <label htmlFor="description">Descrição</label>
            <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Salário, Freelance, Venda..." required />
          </div>
          
          <div>
            <label htmlFor="amount">Valor (R$)</label>
            <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" required />
          </div>

          <div>
            <label htmlFor="date">Data</label>
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <button type="submit">{transacaoEditada ? 'Atualizar Entrada' : 'Registrar Entrada'}</button>
        </div>
      </form>
    </div>
  );
}