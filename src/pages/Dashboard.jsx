import { useCallback, useEffect, useState } from 'react';
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
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useData } from '../contexts/DataContext';

// Registrando componentes do Chart.js
ChartJS.register(Tooltip, Legend, ArcElement, Title, DoughnutController);

export default function Dashboard() {
  const { theme } = useOutletContext();
  
  // Puxando os dados globais da memória (cache)
  const { transacoes: todasTransacoes, despesasFixas, cofrinhos, isLoadingGlobal } = useData();

  // Estado local para forçar a re-animação do gráfico toda vez que a aba é aberta
  const [isAnimating, setIsAnimating] = useState(true);
  const [dataType, setDataType] = useState('saidas');
  
  // Novos estados para Filtro Temporal e Privacidade
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hideValues, setHideValues] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Estados para animar as barras de progresso
  const [budgetAnimPerc, setBudgetAnimPerc] = useState(0);
  const [cofrinhoAnimPerc, setCofrinhoAnimPerc] = useState(0);

  // Filtra as transações globais apenas para o mês selecionado
  const startStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endStr = format(endOfMonth(currentDate), 'yyyy-MM-dd');
  
  const currentMonthTransactions = todasTransacoes.filter(t => {
    const tDate = t.date.substring(0, 10);
    return tDate >= startStr && tDate <= endStr;
  });

  const transacoes = currentMonthTransactions.filter(t => t.tipo === 'saida');
  const entradas = currentMonthTransactions.filter(t => t.tipo === 'entrada');

  // Total Cofrinho
  const cofrinho = {
    saldo: cofrinhos.reduce((acc, curr) => acc + Number(curr.saldo), 0),
    meta: cofrinhos.reduce((acc, curr) => acc + Number(curr.meta), 0)
  };

  const handlePrevMonth = useCallback(() => setCurrentDate(subMonths(currentDate, 1)), [currentDate]);
  const handleNextMonth = useCallback(() => setCurrentDate(addMonths(currentDate, 1)), [currentDate]);

  const formatCurrency = (value) => {
    if (hideValues) return 'R$ *****';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

 const handleExportCSV = useCallback(() => {
    const allData = [...entradas, ...transacoes].sort((a, b) => new Date(a.date) - new Date(b.date));
    if (allData.length === 0) {
      alert('Nenhum dado para exportar neste mês.');
      return;
    }

    const escapeCsvCell = (cell) => {
      const str = String(cell === null || cell === undefined ? '' : cell);
      if (str.search(/("|,|\n)/g) >= 0) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Valor'].join(',');

    const rows = allData.map(t => {
      const rowData = [
        t.date,
        t.tipo,
        t.descricao,
        t.categoria || '-', // Usa '-' se não houver categoria (caso das entradas)
        t.valor
      ];
      return rowData.map(escapeCsvCell).join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `zalio_relatorio_${format(currentDate, 'MM_yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [entradas, transacoes, currentDate]);

  // Cálculo do total
  const totalFixas = despesasFixas.reduce((acc, curr) => acc + Number(curr.valor), 0);
  const totalGasto = transacoes.reduce((acc, curr) => acc + Number(curr.valor), 0) + totalFixas;

  // Total de Entradas dinâmico
  const totalEntradas = entradas.reduce((acc, curr) => acc + Number(curr.valor), 0);

  // Efeito para re-animar o gráfico ao montar o componente ou mudar filtros
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 50); // Pequeno delay para o React renderizar com dados zerados primeiro
    return () => clearTimeout(timer);
  }, [currentDate, dataType]); // Re-anima ao trocar de mês ou tipo de dado (saída/entrada)

  // Efeito para animar as barras de progresso ao carregar ou mudar os dados
  useEffect(() => {
    // A animação acontece ao setar para 0 e depois para o valor real com um delay
    setBudgetAnimPerc(0);
    setCofrinhoAnimPerc(0);

    const timer = setTimeout(() => {
      const budgetPercValue = totalEntradas > 0 ? Math.min((totalGasto / totalEntradas) * 100, 100) : (totalGasto > 0 ? 100 : 0);
      const cofrinhoPercValue = cofrinho.meta > 0 ? Math.min((cofrinho.saldo / cofrinho.meta) * 100, 100) : 0;
      setBudgetAnimPerc(budgetPercValue);
      setCofrinhoAnimPerc(cofrinhoPercValue);
    }, 150); // Um delay um pouco maior para dar tempo da UI "piscar" para 0
    return () => clearTimeout(timer);
  }, [totalGasto, totalEntradas, cofrinho.saldo, cofrinho.meta]);

  // Preparação de dados para o gráfico
  const categoriasGrafico = [...CATEGORIAS, 'Fixas'];
  const dadosPorCategoria = categoriasGrafico.map(cat => {
    if (cat === 'Fixas') return totalFixas;
    return transacoes
      .filter(t => t.categoria === cat)
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
  });
  const coresSaidas = categoriasGrafico.map(cat => CATEGORY_COLORS[cat] || '#f97316'); // Laranja para destacar as fixas

  const isSaidas = dataType === 'saidas';
  
  // Lógica de agrupamento para Entradas baseada na descrição (já que não possuem categorias específicas)
  const descricoesEntradas = [...new Set(entradas.map(e => e.descricao))];
  const labelsEntradas = descricoesEntradas.length > 0 ? descricoesEntradas : ['Entradas'];
  const dadosEntradas = descricoesEntradas.length > 0 
    ? descricoesEntradas.map(desc => entradas.filter(e => e.descricao === desc).reduce((acc, curr) => acc + Number(curr.valor), 0))
    : [0];
  const colorsEntradas = labelsEntradas.map((_, i) => ['#10b981', '#3b82f6', '#06b6d4', '#14b8a6', '#0ea5e9', '#34d399'][i % 6]); // Paleta de verdes/azuis

  const currentLabels = isSaidas ? categoriasGrafico : labelsEntradas;
  const rawData = isSaidas ? dadosPorCategoria : dadosEntradas;
  // O truque infalível: Se estiver carregando, passa 0 para tudo. Assim ele é obrigado a subir do chão!
  const currentData = isLoadingGlobal || isAnimating ? currentLabels.map(() => 0) : rawData;
  const currentColors = isSaidas ? coresSaidas : colorsEntradas;

  // Cofrinho
  const valorCofrinho = cofrinho.saldo;
  const metaCofrinho = cofrinho.meta;

  // Descobre qual foi a maior transação (gasto ou entrada) do mês para exibir como destaque
  const maiorTransacao = isSaidas
    ? [...transacoes].sort((a, b) => Number(b.valor) - Number(a.valor))[0]
    : [...entradas].sort((a, b) => Number(b.valor) - Number(a.valor))[0];

  const dataGraph = {
    labels: currentLabels,
    datasets: [
      {
        label: isSaidas ? 'Saídas R$' : 'Entradas R$',
        data: currentData,
        backgroundColor: currentColors,
        borderWidth: 2, 
        borderColor: theme === 'dark' ? '#1f2937' : '#ffffff', // Adiciona uma separação elegante entre as fatias
        borderRadius: 6, // Deixa as pontas das fatias da rosquinha suavemente arredondadas
        hoverOffset: 12, // Efeito de "pular" ajustado para o novo tamanho
        cutout: '70%', // Transforma a pizza em rosquinha (define o tamanho do furo no meio)
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800, // Deixamos um pouco mais rápido para o efeito ficar mais dinâmico
      easing: 'easeOutQuart'
    },
    layout: {
      padding: 15 // Espaço ajustado para a rosquinha não cortar ao passar o mouse
    },
    plugins: {
      legend: {
        display: false // Ocultamos a legenda padrão para usar a nossa customizada
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const val = context.parsed.y !== undefined ? context.parsed.y : context.parsed;
            const formattedVal = hideValues ? 'R$ *****' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
            return `${label}: ${formattedVal}`;
          }
        }
      }
    }
  };

  return (
    <main className="container" style={{ maxWidth: '1250px', padding: '1rem 2rem 2rem' }}>
      <div className="no-print dashboard-header">
        
        {/* Esquerda: Calendário */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div className="calendar-nav-container" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', height: '40px', padding: '0 8px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <button onClick={handlePrevMonth} aria-label="Mês anterior" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-color)', width: '30px', height: '100%', padding: 0, position: 'relative', top: '-8px' }}>&#10094;</button>
            <span style={{ textTransform: 'capitalize', fontWeight: 'bold', width: '130px', textAlign: 'center', fontSize: '1rem', margin: 0 }}>
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button onClick={handleNextMonth} aria-label="Próximo mês" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent', cursor: 'pointer', fontSize: '1.1rem', color: 'var(--text-color)', width: '30px', height: '100%', padding: 0, position: 'relative', top: '-8px' }}>&#10095;</button>
          </div>
        </div>

        {/* Centro: Título Centralizado */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2 style={{ margin: 0, textAlign: 'center', fontSize: '1.5rem', whiteSpace: 'nowrap' }}>Dashboard Financeiro</h2>
        </div>
        
        {/* Direita: Controles de Privacidade e Exportar CSV */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.8rem', position: 'relative', top: '-4px' }}>
          <button onClick={() => setHideValues(!hideValues)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderRadius: '8px', cursor: 'pointer', padding: '0', width: '105px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '500', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', whiteSpace: 'nowrap' }}>
            {hideValues ? '👁️ Mostrar' : '🙈 Ocultar'}
          </button>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)} 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
              title="Opções de Exportação"
              aria-label="Opções de Exportação"
            >
              ⋮
            </button>
            {showExportMenu && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 10, minWidth: '160px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <button onClick={() => { handleExportCSV(); setShowExportMenu(false); }} style={{ width: '100%', padding: '0.8rem 1rem', background: 'none', border: 'none', borderBottom: '1px solid var(--border-color)', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-color)', fontWeight: '500' }}>📄 Exportar CSV</button>
                <button onClick={() => { window.print(); setShowExportMenu(false); }} style={{ width: '100%', padding: '0.8rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '0.95rem', color: 'var(--text-color)', fontWeight: '500' }}>🖨️ Exportar PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-layout-print" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch', opacity: isLoadingGlobal ? 0.6 : 1, transition: 'opacity 0.3s' }}>
        
        {/* Coluna Esquerda: Cards */}
        <div className="dashboard-column-print" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div className="dashboard-card" style={{ padding: '2rem 1.5rem 1.2rem', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Total de Entradas</h3>
            <p className="total-value" style={{ fontSize: '2rem', color: '#10b981', margin: 0 }}>
              {formatCurrency(totalEntradas)}
            </p>
          </div>

          <div className="dashboard-card" style={{ padding: '2rem 1.5rem 1.2rem', margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ margin: '0 0 0.5rem 0' }}>Total de Saídas</h3>
            <p className="total-value" style={{ fontSize: '2rem', color: '#ef4444', margin: 0 }}>
              {formatCurrency(totalGasto)}
            </p>
          </div>

          <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
            <Link to="/adicionar-entrada" style={{ width: '100%', textDecoration: 'none' }}>
              <button style={{ backgroundColor: '#10b981', color: '#fff', width: '100%', margin: 0, padding: '0.8rem', fontSize: '0.95rem', fontWeight: 'bold', boxSizing: 'border-box' }}>+ Entrada</button>
            </Link>
            <Link to="/adicionar-saida" style={{ width: '100%', textDecoration: 'none' }}>
              <button style={{ backgroundColor: '#ef4444', color: '#fff', width: '100%', margin: 0, padding: '0.8rem', fontSize: '0.95rem', fontWeight: 'bold', boxSizing: 'border-box' }}>- Saída</button>
            </Link>
          </div>

          {/* Orçamento do Mês (Gasto vs Recebido) */}
          <div className="dashboard-card" style={{ padding: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Orçamento do Mês</h3>
            <div className="budget-progress-container" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                <span>Gasto vs Recebido</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(totalGasto)} / {formatCurrency(totalEntradas)}</span>
              </div>
              <div className="progress-bar-track" style={{ height: '8px', background: 'var(--bg-app, #e5e7eb)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                {(() => {
                  const isOver = totalGasto > totalEntradas && totalEntradas > 0;
                  const barColor = isOver ? '#ef4444' : (budgetAnimPerc > 80 ? '#f59e0b' : '#10b981');
                  return (
                    <div className="progress-bar-fill" style={{ height: '100%', width: `${budgetAnimPerc}%`, backgroundColor: barColor, borderTop: `8px solid ${barColor}`, boxSizing: 'border-box', transition: 'width 0.8s ease-out' }}></div>
                  );
                })()}
              </div>
              {totalGasto > totalEntradas && totalEntradas > 0 && (
                <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.8rem', marginBottom: 0, textAlign: 'center', fontWeight: '600' }}>
                  Atenção: Você gastou mais do que recebeu!
                </p>
              )}
            </div>

            {/* Cofrinho */}
            <div className="piggy-bank-progress-container" style={{ width: '100%', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem' }}>Meu Cofrinho 🐷</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                <span>Guardado vs Meta</span>
                <span style={{ fontWeight: 500 }}>{formatCurrency(valorCofrinho)} / {formatCurrency(metaCofrinho)}</span>
              </div>
              <div className="progress-bar-track" style={{ height: '8px', background: 'var(--bg-app, #e5e7eb)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div className="progress-bar-fill" style={{ height: '100%', width: `${cofrinhoAnimPerc}%`, backgroundColor: '#3b82f6', borderTop: '8px solid #3b82f6', boxSizing: 'border-box', transition: 'width 0.8s ease-out' }}></div>
              </div>
            </div>
          </div>

        </div>

        {/* Coluna Direita: Gráficos e Legenda */}
        <div className="dashboard-column-print" style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
          
          <div className="chart-controls no-print" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="dataType" style={{ fontWeight: '600', margin: 0 }}>Dados:</label>
              <select 
                id="dataType" 
                value={dataType} 
                onChange={(e) => setDataType(e.target.value)}
                className="input-field"
                style={{ 
                  width: 'auto', 
                  padding: '0.5rem 2.5rem 0.5rem 1rem', 
                  margin: 0,
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%236b7280' viewBox='0 0 16 16'%3E%3Cpath d='M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.8rem center'
                }}
              >
                <option value="saidas">Saídas</option>
                <option value="entradas">Entradas</option>
              </select>
            </div>
          </div>

      {!isLoadingGlobal && (isSaidas ? totalGasto : totalEntradas) === 0 ? (
            <div className="chart-container" style={{ marginTop: '2rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{textAlign:'center', color: 'var(--text-secondary)'}}>Nenhuma {isSaidas ? 'saída' : 'entrada'} registrada neste mês.</p>
            </div>
      ) : (
        /* Mudamos o alignItems de 'center' para 'flex-start' para travar o título no topo */
        <div className="dashboard-content" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '2rem', width: '100%', marginTop: '0.5rem', opacity: isLoadingGlobal ? 0.5 : 1, transition: 'opacity 0.4s ease' }}>
                <div 
                  className="chart-container" 
                  style={{ width: '240px', height: '240px', position: 'relative', flexShrink: 0, margin: '0 auto' }}
                >
                  <Doughnut data={dataGraph} options={options} />
                  {/* Texto Centralizado no Buraco da Rosquinha */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Total</span>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>
                      {formatCurrency(isSaidas ? totalGasto : totalEntradas)}
                    </strong>
                  </div>
                </div>
                
                <div className="custom-legend" style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1.2rem', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Resumo por {isSaidas ? 'Categoria' : 'Descrição'}</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {currentLabels.map((cat, index) => ({ cat, valor: rawData[index], color: currentColors[index] }))
                      .sort((a, b) => a.cat.localeCompare(b.cat))
                      .map(({ cat, valor, color }) => (
                      <li key={cat} className="legend-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span className="legend-color-square" style={{ display: 'inline-block', width: '14px', height: '14px', backgroundColor: color, border: `7px solid ${color}`, boxSizing: 'border-box', borderRadius: '4px' }}></span>
                          <span style={{ fontWeight: '500' }}>{cat}</span>
                        </div>
                        <strong style={{ opacity: 0.9 }}>{formatCurrency(valor)}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Destaque do Mês (Preenche o espaço vazio elegantemente) */}
                {maiorTransacao && (
                  <div style={{ width: '100%', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)' }}>Destaque do Mês</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', padding: '1rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Maior {isSaidas ? 'Gasto' : 'Entrada'}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{maiorTransacao.descricao}</span>
                      </div>
                      <strong style={{ color: isSaidas ? '#ef4444' : '#10b981', fontSize: '1.15rem' }}>
                        {formatCurrency(maiorTransacao.valor)}
                      </strong>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}