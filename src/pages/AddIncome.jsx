import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';
import { addMonths, setDate } from 'date-fns';
import { IconWallet } from '../components/Icons';

export default function AddIncome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth0();
  const { carregarTudo } = useData();
  const transacaoEditada = location.state?.transaction;

  const [descricao, setDescricao] = useState(transacaoEditada?.descricao || '');
  const [valor, setValor] = useState(transacaoEditada?.valor || '');
  const [data, setData] = useState(transacaoEditada?.date || new Date().toISOString().split('T')[0]);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!descricao || !valor) return;
    setSalvando(true);
    
    let submissionDate = new Date(data + 'T00:00:00');
    const day = submissionDate.getDate();

    if (descricao.toLowerCase().includes('salário') && day >= 27 && day <= 31) {
      const nextMonth = addMonths(submissionDate, 1);
      submissionDate = setDate(nextMonth, 1);
    }

    const payload = {
      descricao: descricao.trim(),
      valor: Number(valor),
      date: submissionDate.toISOString().split('T')[0],
      tipo: 'entrada',
      user_id: user?.sub
    };

    const { error } = transacaoEditada
      ? await supabase.from('transactions').update(payload).eq('id', transacaoEditada.id)
      : await supabase.from('transactions').insert([payload]);

    setSalvando(false);
    if (error) {
      alert('Erro ao salvar a entrada: ' + error.message);
      return;
    }
    carregarTudo();
    navigate('/');
  }, [descricao, valor, data, transacaoEditada, navigate, user?.sub, carregarTudo]);

  return (
    <div className="container-focused">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--success-light)',
            color: 'var(--success-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconWallet size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, textAlign: 'left' }}>
              {transacaoEditada ? 'Editar Entrada' : 'Nova Entrada'}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Registre receitas, freelas, salários ou vendas
            </span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="btn-secondary" 
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid">
        <div>
          <label htmlFor="descricao">Descrição da Entrada</label>
          <input 
            type="text" 
            id="descricao" 
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)} 
            placeholder="Ex: Salário, Freelance, Pix recebido..." 
            required 
            autoFocus
          />
        </div>
        
        <div>
          <label htmlFor="valor">Valor Recebido (R$)</label>
          <input 
            type="number" 
            id="valor" 
            value={valor} 
            onChange={(e) => setValor(e.target.value)} 
            placeholder="0.00" 
            step="0.01" 
            min="0" 
            required 
          />
        </div>

        <div>
          <label htmlFor="data">Data do Recebimento</label>
          <input 
            type="date" 
            id="data" 
            value={data} 
            onChange={(e) => setData(e.target.value)} 
            required 
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={salvando}
            style={{ flex: 2, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
          >
            {salvando ? 'Salvando...' : (transacaoEditada ? 'Atualizar Entrada' : 'Salvar Entrada')}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="btn-secondary" 
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}