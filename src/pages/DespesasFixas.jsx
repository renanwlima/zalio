import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importar supabase

export default function DespesasFixas() {
  const [despesas, setDespesas] = useState([]);
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  const carregarDespesas = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('despesas_fixas').select('*').order('dia_vencimento', { ascending: true });
      if (error) {
        console.error('Erro ao buscar despesas:', error.message);
      } else {
        console.log('Dados de despesas fixas carregados:', data); // Adicionado para depuração
        setDespesas(data);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  }, []);

  useEffect(() => {
    carregarDespesas();
  }, [carregarDespesas]);

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
      dia_vencimento: Number(vencimento), // Garante que o vencimento é um número
    };

    if (editandoId) {
      const { error } = await supabase.from('despesas_fixas').update(payload).eq('id', editandoId);
      if (error) {
        alert('Erro ao atualizar despesa: ' + error.message);
      } else {
        alert('Despesa atualizada com sucesso!');
      }
    } else {
      const { error } = await supabase.from('despesas_fixas').insert([payload]);
      if (error) {
        alert('Erro ao registrar despesa: ' + error.message);
      } else {
        alert('Despesa registrada com sucesso!');
      }
    }

    limparFormulario();
    carregarDespesas();
  }, [nome, valor, vencimento, editandoId, carregarDespesas]);

  const handleEdit = (item) => {
    setEditandoId(item.id);
    setNome(item.nome);
    setValor(item.valor);
    setVencimento(item.dia_vencimento);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      const { error } = await supabase.from('despesas_fixas').delete().eq('id', id);
      if (error) {
        alert('Erro ao excluir despesa: ' + error.message);
      } else {
        alert('Despesa excluída com sucesso!');
        carregarDespesas();
      }
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
        <div className="dashboard-card" style={{ flex: '2 1 400px', padding: '1.5rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem' }}>Contas Cadastradas</h3>
          {despesas.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhuma despesa fixa registrada.</p>
          ) : (
            <ul className="expense-list">
              {despesas.map(item => (
                <li key={item.id} className="expense-item">
                  <div className="expense-info">
                    <strong>{item.nome}</strong>
                    <span className="expense-date">Vence todo dia {item.dia_vencimento}</span>
                  </div>
                  <div className="expense-actions">
                    <span className="expense-value" style={{ color: '#ef4444' }}>
                      {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <button onClick={() => handleEdit(item)} title="Editar" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}>✏️</button>
                    <button onClick={() => handleDelete(item.id)} title="Excluir" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
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