import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIAS, CATEGORY_COLORS } from '../services/storage';
import { supabase } from '../supabaseClient';
import { useData } from '../contexts/DataContext';
import { startOfMonth, endOfMonth, format, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  IconSearch, 
  IconEdit, 
  IconTrash, 
  IconArrowDownLeft, 
  IconArrowUpRight,
  IconCategory
} from '../components/Icons';

export default function History() {
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const saved = localStorage.getItem('selectedMonth');
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todas');
  
  const navigate = useNavigate();
  const { transacoes: todasTransacoes, carregarTudo } = useData();
  const [hideValues, setHideValues] = useState(() => localStorage.getItem('hideValues') === 'true');

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

  const startStr = format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endStr = format(endOfMonth(currentDate), 'yyyy-MM-dd');

  const currentMonthTransactions = useMemo(() => {
    return todasTransacoes.filter(t => {
      const tDate = t.date.substring(0, 10);
      return tDate >= startStr && tDate <= endStr;
    });
  }, [todasTransacoes, startStr, endStr]);

  const filteredTransactions = useMemo(() => {
    return currentMonthTransactions.filter(item => {
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase();
        const descMatch = item.descricao?.toLowerCase().includes(query);
        const catMatch = item.categoria?.toLowerCase().includes(query);
        const valMatch = String(item.valor).includes(query);
        if (!descMatch && !catMatch && !valMatch) return false;
      }

      if (filterType !== 'todos' && item.tipo !== filterType) {
        return false;
      }

      if (filterCategory !== 'todas') {
        if (item.tipo === 'saida' && item.categoria !== filterCategory) return false;
      }

      return true;
    });
  }, [currentMonthTransactions, searchTerm, filterType, filterCategory]);

  const totalEntradas = currentMonthTransactions
    .filter(t => t.tipo === 'entrada')
    .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

  const totalSaidas = currentMonthTransactions
    .filter(t => t.tipo === 'saida')
    .reduce((acc, curr) => acc + Number(curr.valor || 0), 0);

  const isCurrentMonth = isSameMonth(currentDate, new Date());
  const handlePrevMonth = useCallback(() => updateCurrentDate(subMonths(currentDate, 1)), [currentDate, updateCurrentDate]);
  const handleNextMonth = useCallback(() => updateCurrentDate(addMonths(currentDate, 1)), [currentDate, updateCurrentDate]);
  const handleCurrentMonth = useCallback(() => updateCurrentDate(new Date()), [updateCurrentDate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu-container')) {
        setMenuAbertoId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) console.error('Erro ao excluir lançamento:', error.message);
      carregarTudo();
    }
  }, [carregarTudo]);

  const handleEdit = useCallback((item) => {
    if (item.tipo === 'entrada') {
      navigate('/adicionar-entrada', { state: { transaction: item } });
    } else {
      navigate('/adicionar-saida', { state: { transaction: item } });
    }
  }, [navigate]);

  return (
    <div className="container-fit" style={{ maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div className="history-top-header">
        <div className="history-month-nav">
          <div className="calendar-nav-box" style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.2rem 0.4rem',
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
                fontSize: '1rem',
                cursor: 'pointer',
                padding: '0.35rem 0.65rem'
              }}
            >
              &#10094;
            </button>

            <span style={{
              textTransform: 'capitalize',
              fontWeight: 700,
              fontSize: '0.95rem',
              minWidth: '135px',
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
                fontSize: '1rem',
                cursor: 'pointer',
                padding: '0.35rem 0.65rem'
              }}
            >
              &#10095;
            </button>
          </div>

          {!isCurrentMonth && (
            <button 
              onClick={handleCurrentMonth}
              className="btn-secondary btn-today"
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            >
              Hoje
            </button>
          )}
        </div>

        {/* Resumo do Mês em Badges */}
        <div className="history-summary-badges">
          <div className="history-badge-item" style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Entradas:</span>
            <strong className="currency-val" style={{ color: 'var(--success-color)', fontSize: '0.92rem' }}>
              +{formatCurrency(totalEntradas)}
            </strong>
          </div>

          <div className="history-badge-item" style={{ background: 'var(--error-light)', border: '1px solid var(--error-border)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Saídas:</span>
            <strong className="currency-val" style={{ color: 'var(--error-color)', fontSize: '0.92rem' }}>
              -{formatCurrency(totalSaidas)}
            </strong>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="modern-card" style={{ marginBottom: '0.85rem', padding: '0.75rem 1.15rem', flexShrink: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', alignItems: 'center' }}>
          {/* Campo de Busca */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ position: 'absolute', left: '0.75rem', pointerEvents: 'none', color: 'var(--text-muted)' }}>
              <IconSearch size={16} />
            </div>
            <input 
              type="text"
              placeholder="Buscar por descrição ou valor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ margin: 0, paddingLeft: '2.2rem' }}
            />
          </div>

          {/* Filtro por Tipo */}
          <div style={{ display: 'flex', gap: '0.3rem', background: 'var(--bg-subtle)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'todos', label: 'Todas' },
              { id: 'entrada', label: 'Entradas' },
              { id: 'saida', label: 'Saídas' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterType(tab.id)}
                style={{
                  flex: 1,
                  background: filterType === tab.id ? 'var(--card-bg)' : 'transparent',
                  color: filterType === tab.id ? 'var(--primary-color)' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.825rem',
                  padding: '0.35rem 0.45rem',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  boxShadow: filterType === tab.id ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filtro por Categoria */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field"
              style={{ margin: 0 }}
            >
              <option value="todas">Todas as Categorias</option>
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Transações */}
      <div className="modern-card" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexShrink: 0 }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0 }}>
            Lançamentos ({filteredTransactions.length})
          </h3>
          {(searchTerm || filterType !== 'todos' || filterCategory !== 'todas') && (
            <button 
              onClick={() => { setSearchTerm(''); setFilterType('todos'); setFilterCategory('todas'); }}
              className="btn-secondary"
              style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem' }}
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)' }}>
            <p style={{ margin: 0 }}>Nenhum lançamento encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <ul className="tx-list custom-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '0.35rem', margin: 0 }}>
            {filteredTransactions.map((item, index) => {
              const isEntrada = item.tipo === 'entrada';
              const catColor = isEntrada ? '#10b981' : (CATEGORY_COLORS[item.categoria] || '#6b7280');
              const openUp = index >= filteredTransactions.length - 2 && filteredTransactions.length > 2;

              return (
                <li key={item.id} className="tx-item">
                  <div className="tx-icon" style={{
                    background: isEntrada ? 'var(--success-light)' : 'var(--error-light)',
                    color: isEntrada ? 'var(--success-color)' : 'var(--error-color)'
                  }}>
                    {isEntrada ? <IconArrowDownLeft size={16} /> : <IconArrowUpRight size={16} />}
                  </div>

                  <div className="tx-details">
                    <strong className="tx-title">{item.descricao}</strong>
                    <div className="tx-meta">
                      <span>{new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                      {item.categoria && (
                        <span 
                          className="badge" 
                          style={{
                            background: `${catColor}18`,
                            color: catColor,
                            border: `1px solid ${catColor}33`,
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.45rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <IconCategory name={item.categoria} size={12} color={catColor} />
                          {item.categoria}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`tx-amount currency-val ${isEntrada ? 'income' : 'expense'}`}>
                    {isEntrada ? '+' : '-'} {formatCurrency(item.valor)}
                  </div>

                  <div className="action-menu-container">
                    <button 
                      onClick={() => setMenuAbertoId(prev => prev === item.id ? null : item.id)}
                      className="action-menu-trigger"
                      title="Opções"
                      aria-label="Opções"
                    >
                      ⋮
                    </button>
                    {menuAbertoId === item.id && (
                      <div className={`action-menu ${openUp ? 'up' : ''}`}>
                        <button 
                          onClick={() => { handleEdit(item); setMenuAbertoId(null); }}
                          className="action-menu-button"
                          style={{ borderBottom: '1px solid var(--border-color)' }}
                        >
                          <IconEdit size={14} /> Editar
                        </button>
                        <button 
                          onClick={() => { handleDelete(item.id); setMenuAbertoId(null); }}
                          className="action-menu-button"
                          style={{ color: 'var(--error-color)' }}
                        >
                          <IconTrash size={14} /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}