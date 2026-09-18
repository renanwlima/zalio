import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';
import { 
  IconWallet, 
  IconCheck, 
  IconLock
} from '../components/Icons';

// Retorna os feriados nacionais oficiais do Brasil para um determinado ano
function getFeriadosNacionaisBrasil(ano) {
  // Cálculo da Páscoa (Algoritmo Meeus/Jones/Butcher)
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mesPascoa = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const diaPascoa = ((h + l - 7 * m + 114) % 31) + 1;
  const dataPascoa = new Date(ano, mesPascoa, diaPascoa);

  const addDias = (data, dias) => {
    const res = new Date(data);
    res.setDate(res.getDate() + dias);
    return res;
  };

  const carnaval = addDias(dataPascoa, -47);
  const sextaSanta = addDias(dataPascoa, -2);
  const corpusChristi = addDias(dataPascoa, 60);

  const fmt = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  return [
    { key: '01-01', nome: 'Ano Novo' },
    { key: fmt(carnaval), nome: 'Carnaval' },
    { key: fmt(sextaSanta), nome: 'Sexta-feira Santa' },
    { key: '04-21', nome: 'Tiradentes' },
    { key: '05-01', nome: 'Dia do Trabalho' },
    { key: fmt(corpusChristi), nome: 'Corpus Christi' },
    { key: '09-07', nome: 'Independência do Brasil' },
    { key: '10-12', nome: 'Nossa Senhora Aparecida' },
    { key: '11-02', nome: 'Finados' },
    { key: '11-15', nome: 'Proclamação da República' },
    { key: '11-20', nome: 'Dia da Consciência Negra' },
    { key: '12-25', nome: 'Natal' }
  ];
}

// Calcula automaticamente os dias úteis (segunda a sexta) descontando feriados nacionais
function calcularDiasUteisMesAtual(feriadosCustom = null) {
  const now = new Date();
  const ano = now.getFullYear();
  const mes = now.getMonth();
  const feriados = (feriadosCustom && feriadosCustom.length > 0)
    ? feriadosCustom
    : getFeriadosNacionaisBrasil(ano);
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  let diasUteis = 0;
  let diasSemana = 0;
  const feriadosNoMes = [];

  for (let dia = 1; dia <= totalDias; dia++) {
    const data = new Date(ano, mes, dia);
    const diaSemana = data.getDay(); // 0 = Domingo, 6 = Sábado
    const key = `${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const feriado = feriados.find(f => f.key === key);

    if (diaSemana !== 0 && diaSemana !== 6) {
      diasSemana++;
      if (feriado) {
        feriadosNoMes.push({ dia, nome: feriado.nome });
      } else {
        diasUteis++;
      }
    }
  }

  return { 
    diasUteis, 
    diasSemana, 
    feriadosNoMes, 
    totalDias,
    isOnline: Boolean(feriadosCustom && feriadosCustom.length > 0)
  };
}

export default function Dados() {
  const [salario, setSalario] = useState('');
  const [va, setVa] = useState('');
  const [vr, setVr] = useState('');
  const [salvoSucesso, setSalvoSucesso] = useState(false);
  const { user } = useAuth0();
  const { dadosFinanceiros, despesasFixas, carregarTudo } = useData();
  const [hideValues, setHideValues] = useState(() => localStorage.getItem('hideValues') === 'true');
  const [feriadosOnline, setFeriadosOnline] = useState(null);

  // Busca feriados nacionais oficiais diretamente na internet via BrasilAPI
  useEffect(() => {
    const anoAtual = new Date().getFullYear();
    fetch(`https://brasilapi.com.br/api/feriados/v1/${anoAtual}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatados = data.map(item => {
            const parts = item.date.split('-'); // YYYY-MM-DD
            return {
              key: `${parts[1]}-${parts[2]}`,
              nome: item.name
            };
          });
          setFeriadosOnline(formatados);
        }
      })
      .catch(err => {
        // Se estiver sem internet ou a API falhar, o sistema usa o algoritmo local perfeitamente
        console.warn('Usando calendário oficial local como fallback:', err);
      });
  }, []);

  const infoDiasUteis = useMemo(() => calcularDiasUteisMesAtual(feriadosOnline), [feriadosOnline]);
  const nomeMesAtual = useMemo(() => {
    const s = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }, []);

  // Configuração de VR: 'fixo' ou 'diario'
  const vrConfigStorageKey = user?.sub ? `zalio_vr_config_${user.sub}` : 'zalio_vr_config';
  const [vrConfigState, setVrConfigState] = useState(() => {
    try {
      const item = localStorage.getItem(vrConfigStorageKey);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  });

  const [vrTipo, setVrTipo] = useState(() => vrConfigState?.tipo || 'fixo'); // 'fixo' | 'diario'
  const [vrValorDiario, setVrValorDiario] = useState(() => (vrConfigState?.valorDiario ? String(vrConfigState.valorDiario) : ''));
  const [ajusteManual, setAjusteManual] = useState(() => Boolean(vrConfigState?.ajusteManual));
  const [vrDiasManual, setVrDiasManual] = useState(() => vrConfigState?.diasManual || infoDiasUteis.diasUteis);

  const diasUteisFinais = ajusteManual ? (Number(vrDiasManual) || infoDiasUteis.diasUteis) : infoDiasUteis.diasUteis;

  useEffect(() => {
    if (user?.sub) {
      try {
        const item = localStorage.getItem(`zalio_vr_config_${user.sub}`);
        if (item) {
          const parsed = JSON.parse(item);
          setVrConfigState(parsed);
          if (parsed.tipo) setVrTipo(parsed.tipo);
          if (parsed.valorDiario) setVrValorDiario(String(parsed.valorDiario));
          if (parsed.diasManual) setVrDiasManual(parsed.diasManual);
          if (typeof parsed.ajusteManual === 'boolean') setAjusteManual(parsed.ajusteManual);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [user?.sub]);

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

  const valorDiarioNum = Number(vrValorDiario) || Number(vrConfigState?.valorDiario) || 0;
  const vrCalculado = valorDiarioNum * diasUteisFinais;

  const resumoSalario = Number(dadosFinanceiros?.[0]?.salario || 0);
  const resumoVa = Number(dadosFinanceiros?.[0]?.va || 0);
  const resumoVr = Number(dadosFinanceiros?.[0]?.vr || 0);
  const rendaTotal = resumoSalario + resumoVa + resumoVr;

  const totalFixasMensal = despesasFixas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  const percentualComprometido = rendaTotal > 0 ? Math.min(100, Math.round((totalFixasMensal / rendaTotal) * 100)) : 0;
  const saldoLivreEstimado = Math.max(0, rendaTotal - totalFixasMensal);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valorVRFinal;
    if (vrTipo === 'diario') {
      valorVRFinal = vrCalculado > 0 ? vrCalculado : resumoVr;
    } else {
      valorVRFinal = vr !== '' ? Number(vr) : resumoVr;
    }

    const payload = {
      salario: salario !== '' ? Number(salario) : resumoSalario,
      va: va !== '' ? Number(va) : resumoVa,
      vr: Number(valorVRFinal.toFixed(2)),
      user_id: user?.sub
    };
    
    const { error } = await supabase.from('dados_financeiros').insert([payload]);
    if (error) {
      alert('Erro ao salvar dados: ' + error.message);
    } else {
      const novaConfig = {
        tipo: vrTipo,
        valorDiario: vrTipo === 'diario' ? valorDiarioNum : 0,
        ajusteManual,
        diasManual: vrDiasManual,
        diasUteis: diasUteisFinais
      };
      localStorage.setItem(vrConfigStorageKey, JSON.stringify(novaConfig));
      setVrConfigState(novaConfig);

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
            
            {/* Configuração de Vale Refeição (VR) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ margin: 0 }}>Vale Refeição (VR)</label>

              {/* Seletor de Modo: Fixo Mensal vs Por Dia Trabalhado */}
              <div style={{
                display: 'flex',
                gap: '0.3rem',
                background: 'var(--bg-subtle)',
                padding: '0.2rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                marginBottom: '0.3rem'
              }}>
                <button
                  type="button"
                  onClick={() => setVrTipo('fixo')}
                  style={{
                    flex: 1,
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: vrTipo === 'fixo' ? 'var(--card-bg)' : 'transparent',
                    color: vrTipo === 'fixo' ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: vrTipo === 'fixo' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Fixo Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setVrTipo('diario')}
                  style={{
                    flex: 1,
                    padding: '0.35rem 0.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: vrTipo === 'diario' ? 'var(--card-bg)' : 'transparent',
                    color: vrTipo === 'diario' ? 'var(--primary-color)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: vrTipo === 'diario' ? 'var(--shadow-sm)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Por Dia Trabalhado
                </button>
              </div>

              {vrTipo === 'fixo' ? (
                <input 
                  id="vr"
                  type="number" 
                  step="0.01" 
                  value={vr} 
                  onChange={(e) => setVr(e.target.value)} 
                  placeholder={resumoVr > 0 ? formatCurrency(resumoVr).replace('R$', '').trim() : '0.00'} 
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label htmlFor="vrDiario" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Valor pago por dia trabalhado (R$)
                    </label>
                    <input 
                      id="vrDiario"
                      type="number" 
                      step="0.01" 
                      value={vrValorDiario} 
                      onChange={(e) => setVrValorDiario(e.target.value)} 
                      placeholder={vrConfigState?.valorDiario > 0 ? String(vrConfigState.valorDiario) : 'Ex: 35.00'} 
                      style={{ margin: 0 }}
                    />
                  </div>

                  {/* Card de Cálculo 100% Automático */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem'
                  }}>
                    {/* Header do card com badge de automático */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{
                          background: '#10b981',
                          color: '#fff',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.18rem 0.5rem',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          ⚡ Cálculo 100% Automático
                        </span>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {nomeMesAtual}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981' }}>
                        {diasUteisFinais} dias úteis
                      </span>
                    </div>

                    {/* Detalhamento dos feriados nacionais descontados */}
                    <div style={{
                      fontSize: '0.74rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                      background: 'var(--card-bg)',
                      padding: '0.45rem 0.65rem',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)'
                    }}>
                      {infoDiasUteis.feriadosNoMes.length > 0 ? (
                        <>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Feriados nacionais descontados: </span>
                          {infoDiasUteis.feriadosNoMes.map(f => `${f.nome} (dia ${String(f.dia).padStart(2, '0')})`).join(', ')}.
                        </>
                      ) : (
                        <>Descontados automaticamente sábados e domingos do mês (sem feriados nacionais em dias de semana).</>
                      )}
                      <div style={{ marginTop: '0.3rem', fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span>🌐</span>
                        <span>{infoDiasUteis.isOnline ? 'Calendário sincronizado online via BrasilAPI' : 'Calendário oficial nacional integrado'}</span>
                      </div>
                    </div>

                    {/* Resumo do Total */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid rgba(16, 185, 129, 0.2)',
                      paddingTop: '0.45rem'
                    }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Total estimado no mês:
                      </span>
                      <strong className="currency-val" style={{ fontSize: '1.05rem', color: '#10b981' }}>
                        {formatCurrency(vrCalculado)}
                      </strong>
                    </div>

                    {/* Opção para quem precisa de ajuste manual específico */}
                    <div style={{ borderTop: '1px dashed rgba(16, 185, 129, 0.25)', paddingTop: '0.45rem' }}>
                      {!ajusteManual ? (
                        <div style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => setAjusteManual(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: 'var(--text-muted)',
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              textDecoration: 'underline'
                            }}
                          >
                            Teve folga, férias ou escala diferente? Ajustar dias
                          </button>
                        </div>
                      ) : (
                        <div className="vr-manual-box">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>
                              Dias no mês
                            </span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                              Substitui o cálculo automático ({infoDiasUteis.diasUteis}d)
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            {/* Stepper moderno sem setas feias de navegador */}
                            <div className="vr-stepper">
                              <button
                                type="button"
                                className="vr-stepper-btn"
                                onClick={() => setVrDiasManual(d => Math.max(0, Number(d) - 1))}
                                title="Diminuir 1 dia"
                              >
                                −
                              </button>
                              <input
                                type="number"
                                className="vr-stepper-input"
                                value={vrDiasManual}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  setVrDiasManual(isNaN(val) ? '' : Math.max(0, Math.min(31, val)));
                                }}
                              />
                              <button
                                type="button"
                                className="vr-stepper-btn"
                                onClick={() => setVrDiasManual(d => Math.min(31, Number(d) + 1))}
                                title="Aumentar 1 dia"
                              >
                                +
                              </button>
                            </div>

                            {/* Botão de reset elegante */}
                            <button
                              type="button"
                              className="vr-reset-btn"
                              onClick={() => {
                                setAjusteManual(false);
                                setVrDiasManual(infoDiasUteis.diasUteis);
                              }}
                              title="Restaurar dias calculados automaticamente"
                            >
                              ↺ Resetar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              )}
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
                <div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Vale Refeição (VR)</div>
                  {vrConfigState?.tipo === 'diario' && vrConfigState?.valorDiario > 0 ? (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Modo diário: {vrConfigState.diasUteis || infoDiasUteis.diasUteis} dias × {formatCurrency(vrConfigState.valorDiario)}/dia
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Valor fixo mensal
                    </span>
                  )}
                </div>
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