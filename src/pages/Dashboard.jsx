import { useCallback, useEffect, useState, useMemo } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { 
  Chart as ChartJS, 
  Tooltip, 
  Legend, 
  ArcElement, 
  Title,
  DoughnutController
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CATEGORIAS, CATEGORY_COLORS } from '../services/storage';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';
import { 
  IconTrendUp, 
  IconTrendDown, 
  IconWallet, 
  IconCreditCard, 
  IconPiggyBank, 
  IconCalendar, 
  IconEye, 
  IconEyeOff, 
  IconPlus, 
  IconMinus,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCategory,
  IconReceipt
} from '../components/Icons';

ChartJS.register(Tooltip, Legend, ArcElement, Title, DoughnutController);

export default function Dashboard() {
  const { theme } = useOutletContext();
  const { transacoes: todasTransacoes, despesasFixas, cofrinhos, dadosFinanceiros, isLoadingGlobal } = useData();

  const [isAnimating, setIsAnimating] = useState(true);
  const [dataType, setDataType] = useState('saidas');
  const [currentDate, setCurrentDate] = useState(() => {
    const saved = localStorage.getItem('selectedMonth');
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [hideValues, setHideValues] = useState(() => localStorage.getItem('hideValues') === 'true');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [budgetAnimPerc, setBudgetAnimPerc] = useState(0);
  const [cofrinhoAnimPerc, setCofrinhoAnimPerc] = useState(0);

  const updateCurrentDate = useCallback((newDate) => {
    setCurrentDate(newDate);
    localStorage.setItem('selectedMonth', newDate.toISOString());
    window.dispatchEvent(new Event('monthChanged'));
  }, []);

  useEffect(() => {
    const handleMonthSync = () => {
      const saved = localStorage.getItem('selectedMonth');
      if (saved) {
        const parsed = new Date(saved);
        if (!isNaN(parsed.getTime())) setCurrentDate(parsed);
      }
    };
    window.addEventListener('monthChanged', handleMonthSync);
    window.addEventListener('storage', (e) => {
      if (e.key === 'selectedMonth') handleMonthSync();
    });
    return () => {
      window.removeEventListener('monthChanged', handleMonthSync);
    };
  }, []);

  // Sincronização da privacidade entre abas/telas
  useEffect(() => {
    const handleSync = () => setHideValues(localStorage.getItem('hideValues') === 'true');
    window.addEventListener('hideValuesChanged', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('hideValuesChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const toggleHideValues = () => {
    const newVal = !hideValues;
    setHideValues(newVal);
    localStorage.setItem('hideValues', newVal.toString());
    window.dispatchEvent(new Event('hideValuesChanged'));
  };

  // Filtragem temporal das transações para o mês selecionado
  const startStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endStr = format(endOfMonth(currentDate), 'yyyy-MM-dd');
  
  const currentMonthTransactions = todasTransacoes.filter(t => {
    const tDate = t.date.substring(0, 10);
    return tDate >= startStr && tDate <= endStr;
  });

  const transacoesSaidas = currentMonthTransactions.filter(t => t.tipo === 'saida');
  const transacoesEntradas = currentMonthTransactions.filter(t => t.tipo === 'entrada');

  // Cálculos financeiros
  const totalFixas = despesasFixas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  const totalVariaveis = transacoesSaidas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  const totalGasto = totalVariaveis + totalFixas;
  const totalEntradas = transacoesEntradas.reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  const saldoLiquido = totalEntradas - totalGasto;

  // Taxa de economia (% guardada ou que sobrou)
  const taxaEconomia = totalEntradas > 0 
    ? Math.max(0, Math.round((saldoLiquido / totalEntradas) * 100)) 
    : 0;

  // Cofrinhos
  const cofrinhoTotal = {
    saldo: cofrinhos.reduce((acc, curr) => acc + Number(curr.saldo || 0), 0),
    meta: cofrinhos.reduce((acc, curr) => acc + Number(curr.meta || 0), 0)
  };

  const isCurrentMonth = isSameMonth(currentDate, new Date());
  const handlePrevMonth = useCallback(() => updateCurrentDate(subMonths(currentDate, 1)), [currentDate, updateCurrentDate]);
  const handleNextMonth = useCallback(() => updateCurrentDate(addMonths(currentDate, 1)), [currentDate, updateCurrentDate]);
  const handleCurrentMonth = useCallback(() => updateCurrentDate(new Date()), [updateCurrentDate]);

  const formatCurrency = (value) => {
    if (hideValues) return 'R$ ••••••';
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Exportação CSV
  const handleExportCSV = useCallback(() => {
    const allData = [...transacoesEntradas, ...transacoesSaidas].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (allData.length === 0) {
      alert('Nenhum dado para exportar neste mês.');
      return;
    }

    const escapeCsvCell = (cell) => {
      const str = String(cell === null || cell === undefined ? '' : cell);
      if (str.search(/("|,|\n)/g) >= 0) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'].join(',');
    const rows = allData.map(t => [
      t.date,
      t.tipo,
      t.descricao,
      t.categoria || 'Entrada',
      t.valor
    ].map(escapeCsvCell).join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zalio_relatorio_${format(currentDate, 'MM_yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [transacoesEntradas, transacoesSaidas, currentDate]);

  // Impressão / Exportação PDF limpa e sem elementos de tela
  const handlePrintReport = useCallback(() => {
    setShowExportMenu(false);
    const wasHidden = hideValues;
    if (wasHidden) {
      setHideValues(false);
    }
    setTimeout(() => {
      window.print();
      if (wasHidden) {
        setHideValues(true);
      }
    }, 150);
  }, [hideValues]);

  // Animações dos gráficos e barras
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 50);
    return () => clearTimeout(timer);
  }, [currentDate, dataType]);

  useEffect(() => {
    setBudgetAnimPerc(0);
    setCofrinhoAnimPerc(0);
    const timer = setTimeout(() => {
      const budgetPerc = totalEntradas > 0 
        ? Math.min((totalGasto / totalEntradas) * 100, 100) 
        : (totalGasto > 0 ? 100 : 0);
      const cofrinhoPerc = cofrinhoTotal.meta > 0 
        ? Math.min((cofrinhoTotal.saldo / cofrinhoTotal.meta) * 100, 100) 
        : 0;
      setBudgetAnimPerc(budgetPerc);
      setCofrinhoAnimPerc(cofrinhoPerc);
    }, 120);
    return () => clearTimeout(timer);
  }, [totalGasto, totalEntradas, cofrinhoTotal.saldo, cofrinhoTotal.meta]);

  // Dados do gráfico Doughnut
  const isSaidas = dataType === 'saidas';
  const categoriasGrafico = [...CATEGORIAS, 'Fixas'];
  const dadosPorCategoria = categoriasGrafico.map(cat => {
    if (cat === 'Fixas') return totalFixas;
    return transacoesSaidas
      .filter(t => t.categoria === cat)
      .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);
  });
  const coresSaidas = categoriasGrafico.map(cat => CATEGORY_COLORS[cat] || '#f97316');

  const descricoesEntradas = [...new Set(transacoesEntradas.map(e => e.descricao))];
  const labelsEntradas = descricoesEntradas.length > 0 ? descricoesEntradas : ['Entradas'];
  const dadosEntradas = descricoesEntradas.length > 0 
    ? descricoesEntradas.map(desc => transacoesEntradas.filter(e => e.descricao === desc).reduce((acc, curr) => acc + Number(curr.valor || 0), 0))
    : [0];
  const colorsEntradas = labelsEntradas.map((_, i) => ['#10b981', '#3b82f6', '#06b6d4', '#14b8a6', '#0ea5e9', '#34d399'][i % 6]);

  const currentLabels = isSaidas ? categoriasGrafico : labelsEntradas;
  const rawData = isSaidas ? dadosPorCategoria : dadosEntradas;
  const currentData = isLoadingGlobal || isAnimating ? currentLabels.map(() => 0) : rawData;
  const currentColors = isSaidas ? coresSaidas : colorsEntradas;

  const totalParaPorcentagem = rawData.reduce((a, b) => a + b, 0);

  // Destaques e rankings
  const maiorGasto = [...transacoesSaidas].sort((a, b) => Number(b.valor) - Number(a.valor))[0];
  const maiorEntrada = [...transacoesEntradas].sort((a, b) => Number(b.valor) - Number(a.valor))[0];
  const ultimasTransacoes = [...currentMonthTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  // Lista completa ordenada para o relatório de impressão/PDF
  const todasTransacoesOrdenadas = useMemo(() => {
    return [...currentMonthTransactions].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [currentMonthTransactions]);

  // Fatias vetoriais perfeitas do gráfico de rosca para o PDF (100% circular, nunca deforma)
  const svgDonutSlices = useMemo(() => {
    const totalVal = rawData.reduce((acc, curr) => acc + (Number(curr) || 0), 0);
    const circumference = 2 * Math.PI * 66; // ~414.69
    let accumulated = 0;
    return currentLabels.map((cat, idx) => {
      const val = Number(rawData[idx]) || 0;
      if (val <= 0 || totalVal <= 0) return null;
      const ratio = val / totalVal;
      const strokeDash = ratio * circumference;
      const offset = accumulated;
      accumulated += strokeDash;
      return {
        cat,
        color: currentColors[idx] || '#64748b',
        dashArray: `${strokeDash.toFixed(2)} ${(circumference - strokeDash).toFixed(2)}`,
        dashOffset: -offset.toFixed(2)
      };
    }).filter(Boolean);
  }, [rawData, currentLabels, currentColors]);

  // Próximas contas fixas do mês
  const hojeDia = new Date().getDate();
  const contasOrdenadas = [...despesasFixas].sort((a, b) => Number(a.vencimento) - Number(b.vencimento));

  const dataGraph = {
    labels: currentLabels,
    datasets: [
      {
        label: isSaidas ? 'Saídas R$' : 'Entradas R$',
        data: currentData,
        backgroundColor: currentColors,
        borderWidth: 2,
        borderColor: theme === 'dark' ? '#141c2e' : '#ffffff',
        borderRadius: 4,
        hoverOffset: 6,
        cutout: '68%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: theme === 'dark' ? '#1a243b' : '#0f172a',
        padding: 8,
        cornerRadius: 6,
        titleFont: { family: 'Plus Jakarta Sans', size: 11, weight: 'bold' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const val = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            const perc = totalParaPorcentagem > 0 ? Math.round((val / totalParaPorcentagem) * 100) : 0;
            const formatted = hideValues ? 'R$ ••••••' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
            return ` ${label}: ${formatted} (${perc}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="container-fit">
      {/* Cabeçalho do Relatório exclusivo para Impressão / PDF */}
      <div className="print-report-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.15rem' }}>
              Zalio • Relatório Executivo
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Visão Geral Financeira
            </h1>
            <p style={{ fontSize: '0.82rem', margin: '0.15rem 0 0 0', color: '#475569', textTransform: 'capitalize' }}>
              Mês de Referência: <strong>{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</strong>
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5 }}>
            <div><strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div><strong>Balanço:</strong> <span style={{ color: saldoLiquido >= 0 ? '#059669' : '#e11d48', fontWeight: 700 }}>{saldoLiquido >= 0 ? 'Superávit' : 'Déficit'} ({formatCurrency(saldoLiquido)})</span></div>
          </div>
        </div>
      </div>

      {/* --- BARRA SUPERIOR DE CONTROLE (COMPACTA) --- */}
      <div className="no-print" style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '0.65rem',
        marginBottom: '0.65rem',
        flexShrink: 0
      }}>
        {/* Navegador de Mês */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.15rem 0.3rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <button 
              onClick={handlePrevMonth} 
              aria-label="Mês anterior"
              className="calendar-nav-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0.25rem 0.55rem'
              }}
            >
              &#10094;
            </button>

            <span style={{
              textTransform: 'capitalize',
              fontWeight: 700,
              fontSize: '0.9rem',
              minWidth: '130px',
              textAlign: 'center',
              color: 'var(--text-main)'
            }}>
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </span>

            <button 
              onClick={handleNextMonth} 
              aria-label="Próximo mês"
              className="calendar-nav-btn"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                cursor: 'pointer',
                padding: '0.25rem 0.55rem'
              }}
            >
              &#10095;
            </button>
          </div>

          {!isCurrentMonth && (
            <button 
              onClick={handleCurrentMonth}
              className="btn-secondary"
              style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
            >
              Hoje
            </button>
          )}
        </div>

        {/* Ações Rápidas & Privacidade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/adicionar-entrada" className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '0.4rem 0.8rem', fontSize: '0.825rem' }}>
            <IconPlus size={14} /> Nova Entrada
          </Link>

          <Link to="/adicionar-saida" className="btn-primary" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', padding: '0.4rem 0.8rem', fontSize: '0.825rem' }}>
            <IconMinus size={14} /> Novo Gasto
          </Link>

          {/* Toggle de Privacidade */}
          <button 
            onClick={toggleHideValues}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.7rem', fontSize: '0.825rem' }}
            title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            aria-label="Alternar Privacidade"
          >
            {hideValues ? <><IconEye size={15} /> Mostrar</> : <><IconEyeOff size={15} /> Ocultar</>}
          </button>

          {/* Menu Exportar */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary"
              style={{ padding: '0.4rem 0.6rem' }}
              title="Exportar Relatório"
              aria-label="Opções de Exportação"
            >
              ⋮
            </button>
            {showExportMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.3rem',
                background: 'var(--card-bg-elevated)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 40,
                minWidth: '150px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)'
              }}>
                <button 
                  onClick={() => { handleExportCSV(); setShowExportMenu(false); }}
                  className="action-menu-button"
                  style={{ borderBottom: '1px solid var(--border-color)' }}
                >
                  Exportar CSV
                </button>
                <button 
                  onClick={handlePrintReport}
                  className="action-menu-button"
                >
                  Imprimir / PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- GRID DE 4 KPIS NO TOPO (COMPACTO) --- */}
      <section className="dashboard-kpi-grid" style={{ flexShrink: 0 }}>
        {/* KPI 1: Saldo Líquido */}
        <div className="kpi-card kpi-balance">
          <div className="kpi-header">
            <span className="kpi-title">Balanço do Mês</span>
            <div className="kpi-icon-wrap" style={{ background: saldoLiquido >= 0 ? 'var(--success-light)' : 'var(--error-light)', color: saldoLiquido >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
              {saldoLiquido >= 0 ? <IconTrendUp size={15} /> : <IconTrendDown size={15} />}
            </div>
          </div>
          <div className="kpi-value currency-val" style={{ color: saldoLiquido >= 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
            {formatCurrency(saldoLiquido)}
          </div>
          <div className="kpi-footer">
            <span className={`badge ${saldoLiquido >= 0 ? 'badge-success' : 'badge-danger'}`} style={{ padding: '0.05rem 0.4rem', fontSize: '0.68rem' }}>
              {saldoLiquido >= 0 ? 'Superávit' : 'Déficit'}
            </span>
            <span>Entradas - Saídas</span>
          </div>
        </div>

        {/* KPI 2: Total de Entradas */}
        <div className="kpi-card kpi-income">
          <div className="kpi-header">
            <span className="kpi-title">Receitas / Entradas</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--success-light)', color: 'var(--success-color)' }}>
              <IconWallet size={15} />
            </div>
          </div>
          <div className="kpi-value currency-val" style={{ color: 'var(--success-color)' }}>
            {formatCurrency(totalEntradas)}
          </div>
          <div className="kpi-footer">
            <span className="badge badge-success" style={{ padding: '0.05rem 0.4rem', fontSize: '0.68rem' }}>
              {transacoesEntradas.length} {transacoesEntradas.length === 1 ? 'entrada' : 'entradas'}
            </span>
            {dadosFinanceiros?.[0]?.salario > 0 && (
              <span style={{ fontSize: '0.7rem' }}>
                Base: {formatCurrency(dadosFinanceiros[0].salario)}
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Total de Saídas */}
        <div className="kpi-card kpi-expense">
          <div className="kpi-header">
            <span className="kpi-title">Total de Despesas</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--error-light)', color: 'var(--error-color)' }}>
              <IconCreditCard size={15} />
            </div>
          </div>
          <div className="kpi-value currency-val" style={{ color: 'var(--error-color)' }}>
            {formatCurrency(totalGasto)}
          </div>
          <div className="kpi-footer">
            <span>Fixas: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(totalFixas)}</strong></span>
            <span>•</span>
            <span>Var: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(totalVariaveis)}</strong></span>
          </div>
        </div>

        {/* KPI 4: Taxa de Economia */}
        <div className="kpi-card kpi-savings">
          <div className="kpi-header">
            <span className="kpi-title">Taxa de Poupança</span>
            <div className="kpi-icon-wrap" style={{ background: 'var(--accent-purple-light)', color: 'var(--accent-purple)' }}>
              <IconPiggyBank size={15} />
            </div>
          </div>
          <div className="kpi-value tabular-nums" style={{ color: 'var(--accent-purple)' }}>
            {taxaEconomia}%
          </div>
          <div className="kpi-footer">
            <span className={`badge ${taxaEconomia >= 20 ? 'badge-success' : taxaEconomia > 0 ? 'badge-info' : 'badge-danger'}`} style={{ padding: '0.05rem 0.4rem', fontSize: '0.68rem' }}>
              {taxaEconomia >= 20 ? 'Excelente' : taxaEconomia > 0 ? 'No Azul' : 'Atenção'}
            </span>
            <span>da renda sobrou</span>
          </div>
        </div>
      </section>

      {/* --- GRID PRINCIPAL FLUIDO (SE ENCAIXA 100% NO VIEWPORT DO DESKTOP) --- */}
      <div className="dashboard-main-grid-fixed">
        
        {/* COLUNA ESQUERDA: GRÁFICO + BARRA DUPLA DE ORÇAMENTO & COFRINHO */}
        <div className="dashboard-section-fixed">
          
          {/* Card do Gráfico Rosquinha (Fluido e autoajustável com a altura da janela) */}
          <div className="modern-card" style={{ flex: 1, minHeight: '150px', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.4rem',
              flexShrink: 0
            }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', margin: 0 }}>Distribuição Mensal</h3>
                <p style={{ fontSize: '0.74rem', margin: '0.1rem 0 0 0' }}>
                  Detalhamento visual por categoria
                </p>
              </div>

              {/* Seletor Saídas / Entradas */}
              <div className="no-print" style={{
                display: 'flex',
                background: 'var(--bg-subtle)',
                padding: '0.15rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <button
                  type="button"
                  onClick={() => setDataType('saidas')}
                  style={{
                    background: isSaidas ? 'var(--card-bg)' : 'transparent',
                    color: isSaidas ? 'var(--error-color)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    padding: '0.2rem 0.65rem',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: isSaidas ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  Saídas
                </button>
                <button
                  type="button"
                  onClick={() => setDataType('entradas')}
                  style={{
                    background: !isSaidas ? 'var(--card-bg)' : 'transparent',
                    color: !isSaidas ? 'var(--success-color)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    padding: '0.2rem 0.65rem',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    boxShadow: !isSaidas ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  Entradas
                </button>
              </div>
            </div>

            {!isLoadingGlobal && (isSaidas ? totalGasto : totalEntradas) === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)'
                }}>
                  <IconCategory name="Outros" size={22} color="var(--text-muted)" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Nenhuma movimentação registrada</h4>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    Não há {isSaidas ? 'gastos' : 'entradas'} lançados neste mês.
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                padding: '0.25rem 0.15rem',
                overflow: 'hidden'
              }}>
                {/* Visual da Rosquinha Fluida na Tela (interativo via ChartJS) */}
                <div className="chart-doughnut-wrapper no-print" style={{
                  position: 'relative',
                  height: '100%',
                  maxHeight: '215px',
                  minHeight: '110px',
                  aspectRatio: '1 / 1',
                  maxWidth: '100%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <Doughnut data={dataGraph} options={chartOptions} />
                  <div className="chart-doughnut-inner-text" style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    textAlign: 'center',
                    padding: '0.4rem'
                  }}>
                    <span style={{ fontSize: 'clamp(0.55rem, 1.1vh, 0.72rem)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      {isSaidas ? 'Total Gasto' : 'Total Recebido'}
                    </span>
                    <strong className="currency-val" style={{ fontSize: 'clamp(0.92rem, 2.2vh, 1.25rem)', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>
                      {formatCurrency(isSaidas ? totalGasto : totalEntradas)}
                    </strong>
                    <span style={{ fontSize: 'clamp(0.55rem, 1vh, 0.68rem)', color: 'var(--text-muted)', marginTop: '0.05rem' }}>
                      {currentLabels.filter((_, idx) => (rawData[idx] || 0) > 0).length} {currentLabels.filter((_, idx) => (rawData[idx] || 0) > 0).length === 1 ? 'categoria' : 'categorias'}
                    </span>
                  </div>
                </div>

                {/* Visual da Rosquinha Vetorial no PDF / Impressão (100% circular, nunca deforma) */}
                <div className="print-only chart-doughnut-svg-print" style={{
                  flexShrink: 0,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg viewBox="0 0 200 200" width="165" height="165" style={{ display: 'block', margin: '0 auto' }}>
                    <g transform="rotate(-90 100 100)">
                      {svgDonutSlices.map((slice) => (
                        <circle
                          key={slice.cat}
                          cx="100"
                          cy="100"
                          r="66"
                          fill="transparent"
                          stroke={slice.color}
                          strokeWidth="22"
                          strokeDasharray={slice.dashArray}
                          strokeDashoffset={slice.dashOffset}
                        />
                      ))}
                    </g>
                    <text x="100" y="85" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#64748b" letterSpacing="0.05em">
                      {isSaidas ? 'TOTAL GASTO' : 'TOTAL RECEBIDO'}
                    </text>
                    <text x="100" y="106" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#0f172a">
                      {formatCurrency(isSaidas ? totalGasto : totalEntradas)}
                    </text>
                    <text x="100" y="123" textAnchor="middle" fontSize="9" fill="#94a3b8">
                      {currentLabels.filter((_, idx) => (rawData[idx] || 0) > 0).length} {currentLabels.filter((_, idx) => (rawData[idx] || 0) > 0).length === 1 ? 'categoria' : 'categorias'}
                    </text>
                  </svg>
                </div>

                {/* Legenda em Cards Modernos com Barras de Proporção */}
                <div className="custom-scroll" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '100%',
                  overflowY: 'auto',
                  paddingRight: '0.35rem',
                  justifyContent: 'center',
                  flex: 1,
                  minWidth: 0
                }}>
                  {currentLabels.map((cat, idx) => {
                    const val = rawData[idx] || 0;
                    const perc = totalParaPorcentagem > 0 ? Math.round((val / totalParaPorcentagem) * 100) : 0;
                    const color = currentColors[idx];
                    if (val === 0) return null;

                    return (
                      <div key={cat} className="print-category-card" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        background: 'var(--bg-subtle)',
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <IconCategory name={cat} size={15} color={color} />
                            <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-main)' }}>{cat}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', fontWeight: 600 }}>
                              {perc}%
                            </span>
                            <strong className="currency-val" style={{ color: 'var(--text-main)', fontSize: '0.88rem' }}>
                              {formatCurrency(val)}
                            </strong>
                          </div>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--card-bg)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${perc}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sub-grid Dupla Lado a Lado: Orçamento & Cofrinho */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', flexShrink: 0 }}>
            {/* Card: Termômetro do Orçamento */}
            <div className="modern-card" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <IconCreditCard size={14} color="var(--primary-color)" /> Orçamento
                </span>
                <span className="currency-val" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {formatCurrency(totalGasto)} / {formatCurrency(totalEntradas)}
                </span>
              </div>

              <div className="progress-track" style={{ height: '6px' }}>
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${budgetAnimPerc}%`,
                    background: totalGasto > totalEntradas && totalEntradas > 0 
                      ? 'var(--error-color)' 
                      : budgetAnimPerc > 80 
                      ? 'var(--warning-color)' 
                      : 'var(--success-color)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.38rem', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {totalGasto > totalEntradas && totalEntradas > 0 ? (
                    <strong style={{ color: 'var(--error-color)' }}>Déficit no mês</strong>
                  ) : (
                    <span>Livre: <strong style={{ color: 'var(--success-color)' }}>{formatCurrency(Math.max(0, saldoLiquido))}</strong></span>
                  )}
                </span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {Math.round(budgetAnimPerc)}%
                </span>
              </div>
            </div>

            {/* Card: Meu Cofrinho Resumo */}
            <div className="modern-card" style={{ padding: '0.75rem 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <IconPiggyBank size={14} color="var(--accent-purple)" /> Cofrinhos
                </span>
                <Link to="/cofrinho" className="no-print" style={{ fontSize: '0.72rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
                  Acessar →
                </Link>
              </div>

              <div className="progress-track" style={{ height: '6px' }}>
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${cofrinhoAnimPerc}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.38rem', fontSize: '0.75rem' }}>
                <span className="currency-val" style={{ color: 'var(--text-secondary)' }}>
                  Total: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(cofrinhoTotal.saldo)}</strong>
                </span>
                <span className="tabular-nums" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {Math.round(cofrinhoAnimPerc)}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: PRÓXIMOS VENCIMENTOS, DESTAQUES E FEED */}
        <div className="dashboard-section-fixed">
          
          {/* Card: Próximas Contas a Vencer */}
          <div className="modern-card" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <IconCalendar size={15} color="var(--primary-color)" />
                <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Contas Fixas do Mês</h3>
              </div>
              <Link to="/despesas-fixas" className="no-print" style={{ fontSize: '0.74rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
                Ver todas ({formatCurrency(totalFixas)})
              </Link>
            </div>

            {contasOrdenadas.length === 0 ? (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '0.4rem 0', margin: 0 }}>
                Nenhuma conta fixa cadastrada. <Link to="/despesas-fixas" style={{ color: 'var(--primary-color)' }}>Cadastrar</Link>
              </p>
            ) : (
              <div className="custom-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '110px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                {contasOrdenadas.slice(0, 3).map(conta => {
                  const venc = Number(conta.vencimento);
                  const diasRestantes = venc - hojeDia;
                  const statusBadge = diasRestantes === 0 
                    ? { text: 'Vence hoje!', cls: 'badge-danger' }
                    : diasRestantes > 0 && diasRestantes <= 5 
                    ? { text: `Em ${diasRestantes} dias`, cls: 'badge-danger' }
                    : diasRestantes < 0 
                    ? { text: `Dia ${venc}`, cls: 'badge-neutral' }
                    : { text: `Dia ${venc}`, cls: 'badge-info' };

                  return (
                    <div key={conta.id} className="print-fixed-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.35rem 0.65rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>{conta.nome}</strong>
                        <span className={`badge ${statusBadge.cls}`} style={{ fontSize: '0.65rem', padding: '0.08rem 0.35rem' }}>
                          {statusBadge.text}
                        </span>
                      </div>
                      <strong className="currency-val" style={{ color: 'var(--error-color)', fontSize: '0.85rem' }}>
                        {formatCurrency(conta.valor)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Destaques Financeiros (se existirem) */}
          {(maiorGasto || maiorEntrada) && (
            <div className="modern-card" style={{ flexShrink: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {maiorGasto && (
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--error-light)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--error-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--error-color)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <IconTrendDown size={12} /> Maior Gasto
                    </span>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {maiorGasto.descricao}
                    </strong>
                    <span className="currency-val" style={{ fontWeight: 800, color: 'var(--error-color)', fontSize: '0.92rem' }}>
                      {formatCurrency(maiorGasto.valor)}
                    </span>
                  </div>
                )}

                {maiorEntrada && (
                  <div style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--success-light)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--success-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem'
                  }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--success-color)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <IconTrendUp size={12} /> Maior Entrada
                    </span>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {maiorEntrada.descricao}
                    </strong>
                    <span className="currency-val" style={{ fontWeight: 800, color: 'var(--success-color)', fontSize: '0.92rem' }}>
                      {formatCurrency(maiorEntrada.valor)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card: Lançamentos Recentes */}
          <div className="modern-card print-hide" style={{ flex: 1, minHeight: '120px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '0.9rem', margin: 0 }}>Lançamentos Recentes</h3>
              <Link to="/historico" className="no-print" style={{ fontSize: '0.74rem', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 600 }}>
                Ver histórico →
              </Link>
            </div>

            {ultimasTransacoes.length === 0 ? (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                padding: '1.25rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-color)'
                }}>
                  <IconReceipt size={22} color="var(--text-muted)" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    Sem lançamentos neste mês
                  </h4>
                  <p style={{ margin: '0.2rem 0 0.75rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Nenhuma despesa ou receita registrada no período.
                  </p>
                </div>
                <div className="no-print" style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to="/adicionar-entrada" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}>
                    <IconPlus size={13} /> Entrada
                  </Link>
                  <Link to="/adicionar-saida" className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem' }}>
                    <IconMinus size={13} /> Gasto
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="tx-list custom-scroll" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.2rem' }}>
                {ultimasTransacoes.map(item => {
                  const isEntrada = item.tipo === 'entrada';
                  return (
                    <li key={item.id} className="tx-item" style={{ padding: '0.45rem 0.65rem' }}>
                      <div className="tx-icon" style={{
                        width: '26px',
                        height: '26px',
                        background: isEntrada ? 'var(--success-light)' : 'var(--error-light)',
                        color: isEntrada ? 'var(--success-color)' : 'var(--error-color)'
                      }}>
                        {isEntrada ? <IconArrowDownLeft size={13} /> : <IconArrowUpRight size={13} />}
                      </div>
                      <div className="tx-details">
                        <span className="tx-title" style={{ fontSize: '0.82rem' }}>{item.descricao}</span>
                        <span className="tx-meta" style={{ fontSize: '0.7rem' }}>
                          {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                          {item.categoria && <span>• {item.categoria}</span>}
                        </span>
                      </div>
                      <div className={`tx-amount currency-val ${isEntrada ? 'income' : 'expense'}`} style={{ fontSize: '0.86rem', margin: 0 }}>
                        {isEntrada ? '+' : '-'} {formatCurrency(item.valor)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

        </div>
      </div>

      {/* Rodapé institucional da Página 1 do Relatório */}
      <div className="print-only print-page-footer" style={{
        marginTop: '1.25rem',
        paddingTop: '0.6rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.72rem',
        color: '#94a3b8'
      }}>
        <div>Zalio • Relatório Executivo — Visão Geral</div>
        <div>
          {todasTransacoesOrdenadas.length > 0
            ? `Extrato com ${todasTransacoesOrdenadas.length} ${todasTransacoesOrdenadas.length === 1 ? 'lançamento detalhado' : 'lançamentos detalhados'} na página seguinte →`
            : `Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
        </div>
      </div>

      {/* TABELA DE HISTÓRICO COMPLETO DO MÊS EXCLUSIVA PARA IMPRESSÃO / PDF (INICIA LIMPA NA PÁGINA 2) */}
      {todasTransacoesOrdenadas.length > 0 && (
        <div className="print-only print-page-break" style={{ width: '100%' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderBottom: '2px solid #0f172a',
            paddingBottom: '0.5rem',
            marginBottom: '0.85rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Zalio • Extrato Financeiro Detalhado
              </div>
              <h2 style={{ margin: '0.15rem 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Histórico de Lançamentos do Mês
              </h2>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                Relação cronológica completa de receitas e despesas ({todasTransacoesOrdenadas.length} {todasTransacoesOrdenadas.length === 1 ? 'lançamento' : 'lançamentos'})
              </p>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#475569' }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0f172a', textTransform: 'capitalize' }}>
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.68rem', marginTop: '0.15rem' }}>
                Página 2 • Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.78rem',
            color: '#0f172a'
          }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.65rem', fontWeight: 700, width: '90px' }}>Data</th>
                <th style={{ padding: '0.5rem 0.65rem', fontWeight: 700 }}>Descrição</th>
                <th style={{ padding: '0.5rem 0.65rem', fontWeight: 700, width: '130px' }}>Categoria</th>
                <th style={{ padding: '0.5rem 0.65rem', fontWeight: 700, width: '85px', textAlign: 'center' }}>Tipo</th>
                <th style={{ padding: '0.5rem 0.65rem', fontWeight: 700, textAlign: 'right', width: '110px' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {todasTransacoesOrdenadas.map((item, index) => {
                const isEntrada = item.tipo === 'entrada';
                const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
                return (
                  <tr key={item.id || index} style={{
                    background: rowBg,
                    borderBottom: '1px solid #e2e8f0'
                  }}>
                    <td style={{ padding: '0.42rem 0.65rem', color: '#475569', whiteSpace: 'nowrap' }}>
                      {item.date ? new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                    </td>
                    <td style={{ padding: '0.42rem 0.65rem', fontWeight: 600, color: '#0f172a' }}>
                      {item.descricao || 'Sem descrição'}
                    </td>
                    <td style={{ padding: '0.42rem 0.65rem', color: '#475569' }}>
                      {item.categoria || 'Outros'}
                    </td>
                    <td style={{ padding: '0.42rem 0.65rem', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.08rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: isEntrada ? '#d1fae5' : '#fee2e2',
                        color: isEntrada ? '#065f46' : '#991b1b'
                      }}>
                        {isEntrada ? 'Entrada' : 'Saída'}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.42rem 0.65rem',
                      textAlign: 'right',
                      fontWeight: 700,
                      color: isEntrada ? '#059669' : '#e11d48',
                      whiteSpace: 'nowrap'
                    }}>
                      {isEntrada ? '+' : '-'} {formatCurrency(item.valor)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9', borderTop: '2px solid #cbd5e1', fontWeight: 700 }}>
                <td colSpan={3} style={{ padding: '0.55rem 0.65rem', color: '#334155' }}>
                  Totais do Período ({todasTransacoesOrdenadas.length} {todasTransacoesOrdenadas.length === 1 ? 'lançamento' : 'lançamentos'})
                </td>
                <td style={{ padding: '0.55rem 0.65rem', textAlign: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                  Saldo
                </td>
                <td style={{
                  padding: '0.55rem 0.65rem',
                  textAlign: 'right',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  color: saldoLiquido >= 0 ? '#059669' : '#e11d48'
                }}>
                  {saldoLiquido >= 0 ? '+' : ''}{formatCurrency(saldoLiquido)}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Rodapé institucional da Página 2 */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.6rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.7rem',
            color: '#94a3b8'
          }}>
            <div>Zalio • Gestão Financeira Pessoal</div>
            <div>Relatório emitido em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      )}
    </div>
  );
}