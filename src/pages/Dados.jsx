import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';
import { 
  IconWallet, 
  IconCheck, 
  IconLock
} from '../components/Icons';

export default function Dados() {
  const [salario, setSalario] = useState('');
  const [va, setVa] = useState('');
  const [vr, setVr] = useState('');
  const [salvoSucesso, setSalvoSucesso] = useState(false);
  const { user } = useAuth0();
  const { dadosFinanceiros, despesasFixas, carregarTudo } = useData();
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

  const resumoSalario = Number(dadosFinanceiros?.[0]?.salario || 0);
  const resumoVa = Number(dadosFinanceiros?.[0]?.va || 0);
  const resumoVr = Number(dadosFinanceiros?.[0]?.vr || 0);
  const rendaTotal = resumoSalario + resumoVa + resumoVr;

  const totalFixasMensal = despesasFixas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  const percentualComprometido = rendaTotal > 0 ? Math.min(100, Math.round((totalFixasMensal / rendaTotal) * 100)) : 0;
  const saldoLivreEstimado = Math.max(0, rendaTotal - totalFixasMensal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      salario: salario !== '' ? Number(salario) : resumoSalario,
      va: va !== '' ? Number(va) : resumoVa,
      vr: vr !== '' ? Number(vr) : resumoVr,
      user_id: user?.sub
    };
    
    const { error } = await supabase.from('dados_financeiros').insert([payload]);
    if (error) {
      alert('Erro ao salvar dados: ' + error.message);
    } else {
      setSalario('');
      setVa('');
      setVr('');
      setSalvoSucesso(true);
      setTimeout(() => setSalvoSucesso(false), 3000);
      carregarTudo();
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div style={{
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <h2 style={{ fontSize: '1.5rem', margin: 0, textAlign: 'left' }}>Meus Dados Financeiros</h2>
        <p style={{ fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
          Configure sua renda e benefícios para calibrar orçamentos e relatórios automáticos
        </p>
      </div>

      <div className="dados-page-grid">
        
        {/* Formulário de Rendimentos (Esquerda) */}
        <div className="modern-card dados-form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <IconWallet size={18} color="var(--primary-color)" />
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Atualizar Renda Mensal</h3>
          </div>

          {salvoSucesso && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 0.85rem',
              background: 'var(--success-light)',
              border: '1px solid var(--success-border)',
              color: 'var(--success-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 600,
              marginBottom: '1rem'
            }}>
              <IconCheck size={16} /> Rendimentos atualizados com sucesso!
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid">
            <div>
              <label htmlFor="salario">Salário / Renda Principal (R$)</label>
              <input 
                id="salario"
                type="number" 
                step="0.01" 
                value={salario} 
                onChange={(e) => setSalario(e.target.value)} 
                placeholder={resumoSalario > 0 ? formatCurrency(resumoSalario).replace('R$', '').trim() : '0.00'} 
              />
            </div>
            
            <div>
              <label htmlFor="va">Vale Alimentação (VA) (R$)</label>
              <input 
                id="va"
                type="number" 
                step="0.01" 
                value={va} 
                onChange={(e) => setVa(e.target.value)} 
                placeholder={resumoVa > 0 ? formatCurrency(resumoVa).replace('R$', '').trim() : '0.00'} 
              />
            </div>
            
            <div>
              <label htmlFor="vr">Vale Refeição (VR) (R$)</label>
              <input 
                id="vr"
                type="number" 
                step="0.01" 
                value={vr} 
                onChange={(e) => setVr(e.target.value)} 
                placeholder={resumoVr > 0 ? formatCurrency(resumoVr).replace('R$', '').trim() : '0.00'} 
              />
            </div>
            
            <button type="submit" className="btn-primary" style={{ marginTop: '0.4rem' }}>
              Salvar Rendimentos
            </button>
          </form>
        </div>

        {/* Visão Consolidada & Análise (Direita) */}
        <div className="dados-summary-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card: Detalhamento de Ganhos */}
          <div className="modern-card">
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Composição da Remuneração</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Salário Base / Renda Líquida</span>
                <strong className="currency-val" style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                  {formatCurrency(resumoSalario)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Vale Alimentação (VA)</span>
                <strong className="currency-val" style={{ fontSize: '1rem', color: '#3b82f6' }}>
                  {formatCurrency(resumoVa)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Vale Refeição (VR)</span>
                <strong className="currency-val" style={{ fontSize: '1rem', color: '#10b981' }}>
                  {formatCurrency(resumoVr)}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.35rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>Total Mensal Disponível</strong>
                <strong className="currency-val" style={{ fontSize: '1.35rem', color: 'var(--primary-color)' }}>
                  {formatCurrency(rendaTotal)}
                </strong>
              </div>
            </div>
          </div>

          {/* Card: Capacidade Financeira (Renda vs Contas Fixas) */}
          <div className="modern-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <IconLock size={18} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Comprometimento da Renda</h3>
            </div>

            <div className="dados-metrics-grid">
              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Despesas Fixas
                </span>
                <div className="currency-val" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--error-color)', marginTop: '0.2rem' }}>
                  {formatCurrency(totalFixasMensal)}
                </div>
              </div>

              <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Margem Livre Estimada
                </span>
                <div className="currency-val" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success-color)', marginTop: '0.2rem' }}>
                  {formatCurrency(saldoLivreEstimado)}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <span>{percentualComprometido}% da renda comprometida com contas fixas</span>
              <span>{100 - percentualComprometido}% livre</span>
            </div>

            <div className="progress-track" style={{ height: '7px' }}>
              <div 
                className="progress-fill" 
                style={{
                  width: `${percentualComprometido}%`,
                  background: percentualComprometido > 70 ? 'var(--error-color)' : percentualComprometido > 50 ? 'var(--warning-color)' : 'var(--primary-color)'
                }}
              />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}