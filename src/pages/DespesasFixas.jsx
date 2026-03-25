import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function DespesasFixas() {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [despesas, setDespesas] = useState([]);
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    carregarDespesas();
  }, []);

  const carregarDespesas = async () => {
    const { data } = await supabase.from('despesas_fixas').select('*').order('vencimento', { ascending: true });
    if (data) {
      setDespesas(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { nome, valor: Number(valor), vencimento: Number(vencimento) };
    
    if (editandoId) {
      const { error } = await supabase.from('despesas_fixas').update(payload).eq('id', editandoId);
      if (error) alert('Erro ao atualizar: ' + error.message);
      else {
        limparFormulario();
        carregarDespesas();
      }
    } else {
      const { error } = await supabase.from('despesas_fixas').insert([payload]);
      if (error) alert('Erro ao salvar despesa fixa: ' + error.message);
      else {
        limparFormulario();
        carregarDespesas();
      }
    }
  };

  const limparFormulario = () => {
    setNome(''); setValor(''); setVencimento(''); setEditandoId(null);
  };

  const handleEdit = (item) => {
    setNome(item.nome);
    setValor(item.valor);
    setVencimento(item.vencimento);
    setEditandoId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      const { error } = await supabase.from('despesas_fixas').delete().eq('id', id);
      if (!error) carregarDespesas();
    }
  };

  return (
    <main className="container" style={{ maxWidth: '1000px', paddingTop: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Despesas Fixas</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
        Registre e gerencie suas contas recorrentes mensais (Assinaturas, Aluguel, etc.)
      </p>
        
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Formulário */}
        <div className="dashboard-card" style={{ flex: '1 1 300px', padding: '1.5rem', margin: 0 }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            {editandoId ? 'Editar Despesa' : 'Nova Despesa Fixa'}
          </h3>
          <form onSubmit={handleSubmit} className="grid">
            <div>
              <label>Nome da Conta</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Aluguel, Internet, Netflix..." required />
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
              <button type="submit" style={{ flex: 1, margin: 0 }}>{editandoId ? 'Atualizar' : 'Adicionar'}</button>
              {editandoId && (
                <button type="button" onClick={limparFormulario} style={{ flex: 1, margin: 0, backgroundColor: '#6b7280' }}>Cancelar</button>
              )}
            </div>
          </form>
        </div>
        
        {/* Lista de Despesas */}
        <div className="dashboard-card" style={{ flex: '2 1 400px', padding: '1.5rem', margin: 0, minHeight: '500px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Minhas Despesas Fixas</h3>
          {despesas.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Nenhuma despesa fixa cadastrada.</p>
          ) : (
            <ul className="expense-list" style={{ margin: 0 }}>
              {despesas.map((item) => (
                 <li 
                   key={item.id} 
                   className="expense-item"
                   style={{ borderLeft: `6px solid #f97316`, padding: '0.6rem 1rem', minHeight: 'auto' }}
                 >
                   <div className="expense-info">
                     <strong>{item.nome}</strong>
                     <span className="expense-date">
                       Vence dia: {item.vencimento}
                     </span>
                   </div>
                   <div className="expense-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <span className="expense-value" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                       - {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                     </span>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <button type="button" onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', padding: '0.3rem', margin: 0, cursor: 'pointer', width: 'auto', minWidth: 'auto', height: 'auto', boxShadow: 'none', color: '#3b82f6' }} title="Editar">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                       </button>
                       <button type="button" onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', padding: '0.3rem', margin: 0, cursor: 'pointer', width: 'auto', minWidth: 'auto', height: 'auto', boxShadow: 'none', color: '#ef4444' }} title="Excluir">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       </button>
                     </div>
                   </div>
                 </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}