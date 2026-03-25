import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Cofrinho() {
  const [cofrinhos, setCofrinhos] = useState([]);
  const [nome, setNome] = useState('');
  const [meta, setMeta] = useState('');
  const [saldoAtual, setSaldoAtual] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  
  const [depositandoId, setDepositandoId] = useState(null);
  const [valorDeposito, setValorDeposito] = useState('');

  useEffect(() => {
    carregarCofrinhos();
  }, []);

  const carregarCofrinhos = async () => {
    const { data } = await supabase.from('cofrinho').select('*').order('created_at', { ascending: true });
    if (data) {
      setCofrinhos(data);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    const payload = { 
      nome: nome || 'Meu Sonho', 
      meta: Number(meta),
      saldo: Number(saldoAtual) || 0 // Pega o valor digitado ou assume 0 se estiver vazio
    };
    
    if (editandoId) {
      await supabase.from('cofrinho').update(payload).eq('id', editandoId);
    } else {
      await supabase.from('cofrinho').insert([payload]);
    }
    limparFormulario();
    carregarCofrinhos();
  };

  const handleDepositar = async (e, id, saldoAntigo) => {
    e.preventDefault();
    const novoSaldo = Number(saldoAntigo) + Number(valorDeposito);
    await supabase.from('cofrinho').update({ saldo: novoSaldo }).eq('id', id);
    setDepositandoId(null);
    setValorDeposito('');
    carregarCofrinhos();
  };

  const handleEdit = (item) => {
    setNome(item.nome || '');
    setMeta(item.meta);
    setSaldoAtual(item.saldo);
    setEditandoId(item.id);
    setDepositandoId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cofrinho?')) {
      await supabase.from('cofrinho').delete().eq('id', id);
      carregarCofrinhos();
    }
  };

  const limparFormulario = () => {
    setNome(''); setMeta(''); setSaldoAtual(''); setEditandoId(null);
  };

  return (
    <main className="container" style={{ maxWidth: '1000px', paddingTop: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Meus Cofrinhos 🐷</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
        Crie cofrinhos para diferentes objetivos, edite os valores e acompanhe seus sonhos!
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* Formulário (Esquerda) */}
        <div className="dashboard-card" style={{ flex: '1 1 300px', padding: '1.5rem 2rem', margin: 0, height: '620px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '0.8rem', marginBottom: '1.5rem', marginTop: 0, flexShrink: 0 }}>
            {editandoId ? 'Editar Cofrinho' : 'Novo Cofrinho'}
          </h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            <form onSubmit={handleSalvar} className="grid" style={{ gap: '1rem' }}>
              <div>
                <label style={{ marginBottom: '0.5rem' }}>Nome do Objetivo</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Viagem, Carro Novo..." required />
              </div>
              <div>
                <label style={{ marginBottom: '0.5rem' }}>Valor da Meta (R$)</label>
                <input type="number" step="0.01" value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="Ex: 5000.00" required />
              </div>
              <div>
                <label style={{ marginBottom: '0.5rem' }}>{editandoId ? 'Saldo Atual (R$)' : 'Valor Adicionado (R$)'}</label>
                <input type="number" step="0.01" value={saldoAtual} onChange={(e) => setSaldoAtual(e.target.value)} placeholder="0.00" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="submit" style={{ margin: 0, flex: 1 }}>{editandoId ? 'Atualizar' : 'Criar Cofrinho'}</button>
                {editandoId && (
                  <button type="button" onClick={limparFormulario} style={{ margin: 0, flex: 1, backgroundColor: '#6b7280' }}>Cancelar</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Lista de Cofrinhos (Direita) */}
        <div className="dashboard-card" style={{ flex: '2 1 400px', padding: '1.5rem 2rem', margin: 0, height: '620px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '2px solid #3b82f6', paddingBottom: '0.8rem', marginBottom: '1.5rem', marginTop: 0, flexShrink: 0 }}>Meus Cofrinhos</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cofrinhos.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', margin: 0 }}>Nenhum cofrinho criado ainda.</p>
            ) : (
              cofrinhos.map(item => {
                const perc = item.meta > 0 ? Math.min((item.saldo / item.meta) * 100, 100) : 0;
                return (
                  <div key={item.id} style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', textAlign: 'left' }}>{item.nome || 'Meu Cofrinho'}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', padding: '0.3rem', margin: 0, cursor: 'pointer', width: 'auto', minWidth: 'auto', height: 'auto', boxShadow: 'none', color: '#3b82f6' }} title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', padding: '0.3rem', margin: 0, cursor: 'pointer', width: 'auto', minWidth: 'auto', height: 'auto', boxShadow: 'none', color: '#ef4444' }} title="Excluir">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '1rem', margin: '0 0 0.3rem 0', color: 'var(--text-secondary)' }}>Guardado:</p>
                    <p style={{ fontSize: '2rem', margin: 0, color: '#3b82f6', fontWeight: 'bold' }}>
                      {Number(item.saldo).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p style={{ fontSize: '0.95rem', marginTop: '0.3rem', color: 'var(--text-secondary)' }}>
                      de {Number(item.meta).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>

                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem', fontSize: '0.95rem', fontWeight: '500' }}>
                      <span>Progresso</span>
                      <span style={{ color: perc >= 100 ? '#10b981' : '#3b82f6' }}>{perc.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '16px', background: 'var(--bg-app, #e5e7eb)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <div style={{ height: '100%', width: `${perc}%`, backgroundColor: perc >= 100 ? '#10b981' : '#3b82f6', transition: 'width 0.8s ease-out' }}></div>
                    </div>
                  </div>

                  {depositandoId === item.id ? (
                    <form onSubmit={(e) => handleDepositar(e, item.id, item.saldo)} style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', alignItems: 'center' }}>
                      <input type="number" step="0.01" value={valorDeposito} onChange={(e) => setValorDeposito(e.target.value)} placeholder="Valor (R$)" required style={{ flex: 2, margin: 0, padding: '0.6rem 1rem' }} />
                      <button type="submit" style={{ margin: 0, flex: 1, backgroundColor: '#10b981', padding: '0.6rem' }}>Confirmar</button>
                      <button type="button" onClick={() => {setDepositandoId(null); setValorDeposito('');}} style={{ margin: 0, flex: 1, backgroundColor: '#6b7280', padding: '0.6rem' }}>Cancelar</button>
                    </form>
                  ) : (
                    <button onClick={() => setDepositandoId(item.id)} style={{ marginTop: '1.5rem', backgroundColor: '#10b981', padding: '0.7rem', width: '100%' }}>+ Depositar</button>
                  )}
                </div>
              );
            })
          )}
          </div>
        </div>

      </div>
    </main>
  );
}