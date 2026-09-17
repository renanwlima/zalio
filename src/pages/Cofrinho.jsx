import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';
import { 
  IconPlus, 
  IconPiggyBank, 
  IconTarget, 
  IconEdit, 
  IconTrash, 
  IconClose,
  IconCheck
} from '../components/Icons';

export default function Cofrinho() {
  const [nome, setNome] = useState('');
  const [meta, setMeta] = useState('');
  const [saldoAtual, setSaldoAtual] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal de Depósito
  const [depositandoItem, setDepositandoItem] = useState(null);
  const [valorDeposito, setValorDeposito] = useState('');

  const [animatedPercs, setAnimatedPercs] = useState({});
  const { user } = useAuth0();
  const { cofrinhos, isLoadingGlobal: isLoading, carregarTudo } = useData();
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
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const percs = {};
      cofrinhos.forEach(item => {
        percs[item.id] = item.meta > 0 ? Math.min((item.saldo / item.meta) * 100, 100) : 0;
      });
      setAnimatedPercs(percs);
    }, 100);
    return () => clearTimeout(timer);
  }, [cofrinhos]);

  const abrirModalCriar = () => {
    setNome('');
    setMeta('');
    setSaldoAtual('');
    setEditandoId(null);
    setIsModalOpen(true);
  };

  const abrirModalEditar = (item) => {
    setNome(item.nome || '');
    setMeta(item.meta);
    setSaldoAtual(item.saldo);
    setEditandoId(item.id);
    setIsModalOpen(true);
  };

  const fecharModal = () => {
    setNome('');
    setMeta('');
    setSaldoAtual('');
    setEditandoId(null);
    setIsModalOpen(false);
  };

  const handleSalvar = useCallback(async (e) => {
    e.preventDefault();
    const payload = { 
      nome: nome.trim() || 'Meu Objetivo', 
      meta: Number(meta),
      saldo: Number(saldoAtual) || 0,
      user_id: user?.sub
    };
    
    if (editandoId) {
      const { error } = await supabase.from('cofrinho').update(payload).eq('id', editandoId);
      if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
      const { error } = await supabase.from('cofrinho').insert([payload]);
      if (error) {
        alert('Erro ao criar: ' + error.message);
        return;
      }
    }
    fecharModal();
    carregarTudo();
  }, [nome, meta, saldoAtual, editandoId, carregarTudo, user?.sub]);

  const handleDepositar = useCallback(async (e) => {
    e.preventDefault();
    if (!depositandoItem) return;
    const valorParaDepositar = Number(valorDeposito);
    if (isNaN(valorParaDepositar) || valorParaDepositar <= 0) {
      alert('Por favor, insira um valor de depósito válido.');
      return;
    }
    const novoSaldo = Number(depositandoItem.saldo) + valorParaDepositar;
    const { error } = await supabase.from('cofrinho').update({ saldo: novoSaldo }).eq('id', depositandoItem.id);
    if (error) {
      alert('Erro ao depositar: ' + error.message);
      return;
    }
    setDepositandoItem(null);
    setValorDeposito('');
    carregarTudo();
  }, [depositandoItem, valorDeposito, carregarTudo]);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cofrinho?')) {
      const { error } = await supabase.from('cofrinho').delete().eq('id', id);
      if (error) alert('Erro ao excluir: ' + error.message);
      carregarTudo();
    }
  }, [carregarTudo]);

  const totalGuardado = cofrinhos.reduce((acc, c) => acc + Number(c.saldo || 0), 0);
  const totalMeta = cofrinhos.reduce((acc, c) => acc + Number(c.meta || 0), 0);
  const progressoGeral = totalMeta > 0 ? Math.min(100, Math.round((totalGuardado / totalMeta) * 100)) : 0;

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
          <h2 style={{ fontSize: '1.5rem', margin: 0, textAlign: 'left' }}>Cofrinhos & Metas</h2>
          <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
            Acompanhe o progresso das suas reservas e objetivos financeiros
          </p>
        </div>

        <button onClick={abrirModalCriar} className="btn-primary" style={{ padding: '0.55rem 1rem' }}>
          <IconPlus size={16} /> Novo Objetivo
        </button>
      </div>

      {/* Cartões de Indicador */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="modern-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Guardado
            </span>
            <div className="currency-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary-color)', marginTop: '0.2rem' }}>
              {formatCurrency(totalGuardado)}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconPiggyBank size={20} />
          </div>
        </div>

        <div className="modern-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Meta Consolidada
            </span>
            <div className="currency-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {formatCurrency(totalMeta)}
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-purple-light)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconTarget size={20} />
          </div>
        </div>

        <div className="modern-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Progresso Geral
            </span>
            <div className="tabular-nums" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--success-color)', marginTop: '0.2rem' }}>
              {progressoGeral}%
            </div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--success-light)', color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconCheck size={20} />
          </div>
        </div>
      </div>

      {/* Grid de Cards dos Objetivos */}
      {isLoading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>Carregando dados...</p>
      ) : cofrinhos.length === 0 ? (
        <div className="modern-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Você ainda não criou nenhum cofrinho ou meta.
          </p>
          <button onClick={abrirModalCriar} className="btn-primary">
            <IconPlus size={16} /> Criar meu primeiro objetivo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {cofrinhos.map(item => {
            const perc = animatedPercs[item.id] !== undefined ? animatedPercs[item.id] : 0;
            const isConcluido = Number(item.saldo) >= Number(item.meta) && Number(item.meta) > 0;
            const restante = Math.max(0, Number(item.meta) - Number(item.saldo));

            return (
              <div 
                key={item.id} 
                className="modern-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                {/* Header do Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: isConcluido ? 'var(--success-light)' : 'var(--primary-light)',
                      color: isConcluido ? 'var(--success-color)' : 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isConcluido ? <IconCheck size={20} /> : <IconTarget size={20} />}
                    </div>

                    <div>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', display: 'block' }}>
                        {item.nome}
                      </strong>
                      <span className={`badge ${isConcluido ? 'badge-success' : 'badge-neutral'}`} style={{ marginTop: '0.2rem' }}>
                        {isConcluido ? 'Meta Atingida' : `${perc.toFixed(0)}% concluído`}
                      </span>
                    </div>
                  </div>

                  {/* Ações de Edição/Exclusão */}
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      onClick={() => abrirModalEditar(item)}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                      title="Editar"
                    >
                      <IconEdit size={13} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: 'var(--error-color)' }}
                      title="Excluir"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                </div>

                {/* Valores & Progresso */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <span className="currency-val" style={{ fontSize: '1.6rem', fontWeight: 800, color: isConcluido ? 'var(--success-color)' : 'var(--primary-color)' }}>
                      {formatCurrency(item.saldo)}
                    </span>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                      meta: {formatCurrency(item.meta)}
                    </span>
                  </div>

                  <div className="progress-track" style={{ height: '8px' }}>
                    <div 
                      className="progress-fill" 
                      style={{
                        width: `${perc}%`,
                        background: isConcluido ? 'var(--success-color)' : 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span>{restante > 0 ? `Faltam ${formatCurrency(restante)}` : 'Objetivo cumprido!'}</span>
                    <span className="tabular-nums" style={{ fontWeight: 600 }}>{perc.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Botão de Depósito */}
                <button 
                  onClick={() => { setDepositandoItem(item); setValorDeposito(''); }}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.85rem' }}
                >
                  <IconPlus size={14} /> Depositar neste cofrinho
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar / Editar Cofrinho */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={fecharModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                {editandoId ? 'Editar Objetivo' : 'Novo Objetivo'}
              </h3>
              <button onClick={fecharModal} className="nav-icon-btn" style={{ width: '30px', height: '30px' }}>
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="modal-body grid">
              <div>
                <label htmlFor="cofre-nome">Nome do Objetivo</label>
                <input 
                  id="cofre-nome"
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  placeholder="Ex: Viagem de Férias, Reserva, Carro..." 
                  required 
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="cofre-meta">Valor da Meta (R$)</label>
                <input 
                  id="cofre-meta"
                  type="number" 
                  step="0.01" 
                  value={meta} 
                  onChange={(e) => setMeta(e.target.value)} 
                  placeholder="Ex: 5000.00" 
                  required 
                />
              </div>

              <div>
                <label htmlFor="cofre-saldo">
                  {editandoId ? 'Saldo Atual (R$)' : 'Aporte Inicial (Opcional)'}
                </label>
                <input 
                  id="cofre-saldo"
                  type="number" 
                  step="0.01" 
                  value={saldoAtual} 
                  onChange={(e) => setSaldoAtual(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  {editandoId ? 'Salvar Alterações' : 'Criar Objetivo'}
                </button>
                <button type="button" onClick={fecharModal} className="btn-secondary" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Rápido de Depósito */}
      {depositandoItem && (
        <div className="modal-overlay" onClick={() => setDepositandoItem(null)}>
          <div className="modal-card" style={{ maxWidth: '400px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', margin: 0 }}>
                Depositar em: {depositandoItem.nome}
              </h3>
              <button onClick={() => setDepositandoItem(null)} className="nav-icon-btn" style={{ width: '30px', height: '30px' }}>
                <IconClose size={16} />
              </button>
            </div>

            <form onSubmit={handleDepositar} className="modal-body grid">
              <div>
                <label htmlFor="valorDeposito">Valor do Aporte (R$)</label>
                <input 
                  id="valorDeposito"
                  type="number" 
                  step="0.01" 
                  value={valorDeposito} 
                  onChange={(e) => setValorDeposito(e.target.value)} 
                  placeholder="0.00" 
                  required 
                  autoFocus 
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>
                  Confirmar Depósito
                </button>
                <button type="button" onClick={() => setDepositandoItem(null)} className="btn-secondary" style={{ flex: 1 }}>
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