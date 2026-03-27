import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export default function Dados() {
  const [salario, setSalario] = useState('');
  const [va, setVa] = useState('');
  const [vr, setVr] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data } = await supabase.from('dados_financeiros').select('*').order('created_at', { ascending: false }).limit(1);
    if (data && data.length > 0) {
      setSalario(data[0].salario || '');
      setVa(data[0].va || '');
      setVr(data[0].vr || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      salario: Number(salario),
      va: Number(va),
      vr: Number(vr)
    };
    
    const { error } = await supabase.from('dados_financeiros').insert([payload]);
    if (error) alert('Erro ao salvar: ' + error.message);
  };

  return (
    <main className="container" style={{ maxWidth: '1000px', paddingTop: '1rem' }}>
      <h2 style={{ textAlign: 'center', marginTop: 0 }}>Meus Dados Financeiros</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>
        Mantenha seus rendimentos atualizados para calcular orçamentos com precisão.
      </p>
        
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Formulário (Esquerda) */}
        <div className="dashboard-card" style={{ flex: '1 1 300px', padding: '1.5rem', margin: 0 }}>
          <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem' }}>Atualizar Dados</h3>
          <form onSubmit={handleSubmit} className="grid">
            <div>
              <label>Salário / Renda Principal (R$)</label>
              <input type="number" step="0.01" value={salario} onChange={(e) => setSalario(e.target.value)} placeholder="0.00" />
            </div>
            
            <div>
              <label>Vale Alimentação (VA) (R$)</label>
              <input type="number" step="0.01" value={va} onChange={(e) => setVa(e.target.value)} placeholder="0.00" />
            </div>
            
            <div>
              <label>Vale Refeição (VR) (R$)</label>
              <input type="number" step="0.01" value={vr} onChange={(e) => setVr(e.target.value)} placeholder="0.00" />
            </div>
            
            <button type="submit" style={{ marginTop: '0.5rem', margin: 0 }}>Salvar Dados</button>
          </form>
        </div>

        {/* Visualização Atual (Direita) */}
        <div className="dashboard-card" style={{ flex: '2 1 400px', padding: '2rem 1.5rem', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ textAlign: 'center', marginBottom: '2.5rem', fontSize: '1.4rem' }}>Resumo Atual</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '80%', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Salário / Renda:</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.15rem' }}>{Number(salario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vale Alimentação:</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.15rem', color: '#3b82f6' }}>{Number(va || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Vale Refeição:</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.15rem', color: '#10b981' }}>{Number(vr || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}