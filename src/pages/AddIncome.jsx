import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';
import { addMonths, setDate } from 'date-fns';

export default function AddIncome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth0();
  const { carregarTudo } = useData();
  const transacaoEditada = location.state?.transaction;

  const [descricao, setDescricao] = useState(transacaoEditada?.descricao || '');
  const [valor, setValor] = useState(transacaoEditada?.valor || '');
  const [data, setData] = useState(transacaoEditada?.date || new Date().toISOString().split('T')[0]);

  const handleDescriptionChange = useCallback((e) => setDescricao(e.target.value), []);
  const handleAmountChange = useCallback((e) => setValor(e.target.value), []);
  const handleDateChange = useCallback((e) => setData(e.target.value), []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!descricao || !valor) return;
    
    let submissionDate = new Date(data + 'T00:00:00'); // Analisa a data como local para evitar bugs de fuso horário
    const day = submissionDate.getDate();

    // Se a descrição contiver "salário" (ignorando maiúsculas/minúsculas) e a data for entre dia 27 e 31
    if (descricao.toLowerCase().includes('salário') && day >= 27 && day <= 31) {
      // Move a data para o primeiro dia do mês seguinte
      const nextMonth = addMonths(submissionDate, 1);
      submissionDate = setDate(nextMonth, 1);
    }

    const payload = {
      descricao: descricao,
      valor: Number(valor), // Garante que o valor é um número
      date: submissionDate.toISOString().split('T')[0], // Formata de volta para YYYY-MM-DD
      tipo: 'entrada',
      user_id: user?.sub
    };

    const { error } = transacaoEditada //
      ? await supabase.from('transactions').update(payload).eq('id', transacaoEditada.id) //
      : await supabase.from('transactions').insert([payload]); //

    if (error) {
      console.error('Erro no Supabase:', error);
      alert('Erro ao salvar a entrada: ' + error.message);
      return;
    }
    carregarTudo(); // Atualiza o cache global
    navigate('/'); // Volta para o Dashboard
  }, [descricao, valor, data, transacaoEditada, navigate, user?.sub, carregarTudo]);

  return (
    <div className="container">
      <h2>{transacaoEditada ? 'Editar Entrada' : 'Adicionar Entrada'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <div>
            <label htmlFor="descricao">Descrição</label>
            <input type="text" id="descricao" value={descricao} onChange={handleDescriptionChange} placeholder="Ex: Salário, Freelance, Venda..." required />
          </div>
          
          <div>
            <label htmlFor="valor">Valor (R$)</label>
            <input type="number" id="valor" value={valor} onChange={handleAmountChange} placeholder="0.00" step="0.01" min="0" required />
          </div>

          <div>
            <label htmlFor="data">Data</label>
            <input type="date" id="data" value={data} onChange={handleDateChange} required />
          </div>

          <button type="submit">{transacaoEditada ? 'Atualizar Entrada' : 'Registrar Entrada'}</button>
        </div>
      </form>
    </div>
  );
}