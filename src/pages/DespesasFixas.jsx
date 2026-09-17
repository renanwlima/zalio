import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconClose, 
  IconLock,
  IconCalendar
} from '../components/Icons';

export default function DespesasFixas() {
  const [nome, setNome] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth0();
  const { despesasFixas: despesas, carregarTudo } = useData();
  const [hideValues, setHideValues] = useState(() => localStorage.getItem('hideValues') === 'true');

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
    if (hideValues) return 'R$ ••••••';
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const abrirModalNovo = () => {
    setNome('');
    setValor('');
    setVencimento('');
    setEditandoId(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setNome(item.nome);
    setValor(item.valor);
    setVencimento(item.vencimento);
    setEditandoId(item.id);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setNome('');
    setValor('');
    setVencimento('');
    setEditandoId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!nome || !valor || !vencimento) return;

    const payload = {
      nome: nome.trim(),
      valor: Number(valor),
      vencimento: Number(vencimento),
      user_id: user?.sub
    };

    if (editandoId) {
      const { error } = await supabase.from('despesas_fixas').update(payload).eq('id', editandoId);
      if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
      const { error } = await supabase.from('despesas_fixas').insert([payload]);
      if (error) alert('Erro ao registrar: ' + error.message);
    }

    fecharModal();
    carregarTudo();
  }, [nome, valor, vencimento, editandoId, carregarTudo, user?.sub]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      const { error } = await supabase.from('despesas_fixas').delete().eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      carregarTudo();
    }
  };

  const totalFixas = despesas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  const mediaPorConta = despesas.length > 0 ? (totalFixas / despesas.length) : 0;
  const despesasOrdenadas = [...despesas].sort((a, b) => Number(a.vencimento) - Number(b.vencimento));

  return (
    <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', margin: 0, textAlign: 'left' }}>Despesas Fixas</h2>
          <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
            Controle suas contas mensais e assinaturas recorrentes
          </p>
        </div>

        <button onClick={abrirModalNovo} className="btn-primary" style={{ padding: '0.55rem 1rem' }}>
          <IconPlus size={16} /> Nova Despesa Fixa
        </button>
      </div>

      {/* Cartões de Indicador */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="modern-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Comprometido
            </span>
            <div className="currency-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--error-color)', marginTop: '0.2rem' }}>
              {formatCurrency(totalFixas)}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--error-light)', color: 'var(--error-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconLock size={20} />
          </div>
        </div>

        <div className="modern-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Contas Cadastradas
            </span>
            <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {despesas.length}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconCalendar size={20} />
          </div>
        </div>

        <div className="modern-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Média por Conta
            </span>
            <div className="currency-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {formatCurrency(mediaPorConta)}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconLock size={20} />
          </div>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="modern-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>
          Contas do Mês (Ordenadas por vencimento)
        </h3>

        {despesasOrdenadas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: '1rem' }}>Nenhuma despesa fixa cadastrada ainda.</p>
            <button onClick={abrirModalNovo} className="btn-secondary">
              <IconPlus size={15} /> Cadastrar primeira conta fixa
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {despesasOrdenadas.map(item => (
              <div 
                key={item.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                {/* Dia do Vencimento */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1 }}>Dia</span>
                    <span className="tabular-nums" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>{item.vencimento}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.nome}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Cobrança mensal recorrente
                    </span>
                  </div>
                </div>

                {/* Valor & Ações */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <strong className="currency-val" style={{ fontSize: '1.05rem', color: 'var(--error-color)' }}>
                    {formatCurrency(item.valor)}
                  </strong>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button 
                      onClick={() => abrirModalEditar(item)} 
                      className="btn-secondary" 
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                      title="Editar"
                    >
                      <IconEdit size={14} /> Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="btn-secondary" 
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: 'var(--error-color)' }}
                      title="Excluir"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Cadastro / Edição */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editandoId ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
              </h3>
              <button onClick={fecharModal} className="nav-icon-btn" style={{ width: '30px', height: '30px' }}>
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body grid">
              <div>
                <label htmlFor="nome">Nome / Descrição</label>
                <input 
                  id="nome"
                  type="text" 
                  placeholder="Ex: Aluguel, Internet, Netflix..." 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="valor">Valor Mensal (R$)</label>
                <input 
                  id="valor"
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={valor} 
                  onChange={(e) => setValor(e.target.value)} 
                  required 
                />
              </div>

              <div>
                <label htmlFor="vencimento">Dia do Vencimento (1 a 31)</label>
                <input 
                  id="vencimento"
                  type="number" 
                  min="1" 
                  max="31" 
                  placeholder="Ex: 10" 
                  value={vencimento} 
                  onChange={(e) => setVencimento(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  {editandoId ? 'Salvar Alterações' : 'Cadastrar Despesa'}
                </button>
                <button type="button" onClick={fecharModal} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}