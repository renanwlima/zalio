import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importar supabase
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';

export default function DespesasFixas() {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const { user } = useAuth0();
  const { despesasFixas: despesas, carregarTudo } = useData();
  const [hideValues, setHideValues] = useState(() => localStorage.getItem('hideValues') === 'true');

  // Sincroniza a visibilidade com as outras telas
  useEffect(() => {
    const handleSync = () => setHideValues(localStorage.getItem('hideValues') === 'true');
    window.addEventListener('hideValuesChanged', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('hideValuesChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const formatCurrency = (value) => {
    if (hideValues) return 'R$ *****';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu-container')) {
        setMenuAbertoId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const limparFormulario = () => {
    setNome('');
    setValor('');
    setVencimento('');
    setEditandoId(null);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const payload = {
      nome: nome,
      valor: Number(valor), // Garante que o valor é um número
      vencimento: Number(vencimento), // Garante que o vencimento é um número
      user_id: user?.sub
    };

    if (editandoId) {
      const { error } = await supabase.from('despesas_fixas').update(payload).eq('id', editandoId);
      if (error) {
        alert('Erro ao atualizar despesa: ' + error.message);
      }
    } else {
      const { error } = await supabase.from('despesas_fixas').insert([payload]);
      if (error) {
        alert('Erro ao registrar despesa: ' + error.message);
      }
    }

    limparFormulario();
    carregarTudo();
  }, [nome, valor, vencimento, editandoId, carregarTudo, user?.sub]);

  const handleEdit = (item) => {
    setEditandoId(item.id);
    setNome(item.nome);
    setValor(item.valor);
    setVencimento(item.vencimento);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      const { error } = await supabase.from('despesas_fixas').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir despesa: ' + error.message);
      }
      carregarTudo();
    }
  };

  return (
    <main className="container" style={{ maxWidth: '1000px', paddingTop: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Minhas Despesas Fixas</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
        Registre suas contas recorrentes mensais (Assinaturas, Aluguel, etc.)
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Formulário */}
        <div className="dashboard-card" style={{ flex: '1 1 300px', padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>{editandoId ? 'Editar Despesa' : 'Nova Despesa Fixa'}</h3>
          <form onSubmit={handleSubmit} className="grid">
            <div>
              <label>Nome da Conta</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Aluguel, Internet..." required />
            </div>
            <div>
              <label>Valor Mensal (R$)</label>
              <input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0.00" required />
            </div>
            <div>
              <label>Dia do Vencimento</label>
              <input type="number" min="1" max="31" value={vencimento} onChange={(e) => setVencimento(e.target.value)} placeholder="Ex: 10" required />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" style={{ margin: 0, flex: 1 }}>{editandoId ? 'Atualizar' : 'Adicionar'}</button>
              {editandoId && (
                <button type="button" onClick={limparFormulario} style={{ margin: 0, flex: 1, backgroundColor: '#6b7280' }}>Cancelar</button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Despesas */}
        <div className="dashboard-card" style={{ flex: '2 1 400px', padding: '1.5rem', height: '500px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', flexShrink: 0 }}>Contas Cadastradas</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {despesas.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhuma despesa fixa registrada.</p>
            ) : (
              <ul className="expense-list">
              {despesas.map((item, index) => {
                const openUp = index >= despesas.length - 2 && despesas.length > 2;
                return (
                <li key={item.id} className="expense-item" style={{ padding: '0.8rem 1rem', position: 'relative' }}>
                  <div className="expense-info" style={{ flexGrow: 1 }}>
                    <strong>{item.nome}</strong>
                    <span className="expense-date">Vence todo dia {item.vencimento}</span>
                  </div>
                  <div className="expense-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="expense-value" style={{ color: '#ef4444' }}>
                      {formatCurrency(item.valor)}
                    </span>
                    <div className="action-menu-container">
                      <button onClick={() => setMenuAbertoId(prev => prev === item.id ? null : item.id)} className="action-menu-trigger" title="Opções">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>
                      </button>
                      {menuAbertoId === item.id && (
                        <div className={`action-menu ${openUp ? 'up' : ''}`}>
                          <button onClick={() => { handleEdit(item); setMenuAbertoId(null); }} className="action-menu-button" style={{ borderBottom: '1px solid var(--border-color)' }}>Editar</button>
                          <button onClick={() => { handleDelete(item.id); setMenuAbertoId(null); }} className="action-menu-button" style={{ color: 'var(--error-color)' }}>Excluir</button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )})}
            </ul>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}