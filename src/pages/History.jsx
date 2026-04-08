import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_COLORS } from '../services/storage';
import { supabase } from '../supabaseClient';
import { useData } from '../contexts/DataContext';

export default function History() {
  const [menuAbertoId, setMenuAbertoId] = useState(null);
  const navigate = useNavigate();
  const { transacoes: todasTransacoes, carregarTudo } = useData();

  // Separa as transações que já vieram do cache global
  const entradas = todasTransacoes.filter(t => t.tipo === 'entrada');
  const transacoes = todasTransacoes.filter(t => t.tipo === 'saida');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu-container')) {
        setMenuAbertoId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Dependências vazias

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id); //
      if (error) console.error('Erro ao excluir lançamento:', error.message); //
      carregarTudo(); // Atualiza o cache global
    }
  }, [carregarTudo]);

  const handleEdit = useCallback((item) => {
    if (item.tipo === 'entrada') {
      navigate('/adicionar-entrada', { state: { transaction: item } });
    } else {
      navigate('/adicionar-saida', { state: { transaction: item } });
    }
  }, [navigate]); // Depende de navigate

  return (
    <main className="container" style={{maxWidth: '1100px'}}>
      <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Histórico de Lançamentos</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start' }}>
        
        {/* Coluna Entradas */}
        <div style={{ flex: '1 1 400px', height: '550px', display: 'flex', flexDirection: 'column', padding: '0 0.5rem' }}>
          <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '0.5rem', marginBottom: '1.5rem', flexShrink: 0 }}>Total de Entradas</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {entradas.length === 0 ? (
              <p style={{textAlign:'center', color: 'var(--text-secondary)'}}>Nenhuma entrada registrada.</p>
            ) : (
              <ul className="expense-list">
              {entradas.map((item, index) => {
                const openUp = index >= entradas.length - 2 && entradas.length > 2;
                return (
                <li 
                  key={item.id} 
                  className="expense-item"
                  style={{ borderLeft: `6px solid #10b981`, padding: '0.8rem 1rem', position: 'relative' }}
                >
                  <div className="expense-info" style={{ flexGrow: 1 }}>
                    <strong>{item.descricao}</strong>
                    <span className="expense-date">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="expense-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="expense-value" style={{ color: '#10b981' }}>
                      + {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <div className="action-menu-container">
                      <button onClick={() => setMenuAbertoId(prev => prev === item.id ? null : item.id)} className="action-menu-trigger" title="Opções">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>
                      </button>
                      {menuAbertoId === item.id && (
                        <div className={`action-menu ${openUp ? 'up' : ''}`}>
                          <button onClick={() => { handleEdit(item); setMenuAbertoId(null); }} className="action-menu-button" style={{ borderBottom: '1px solid var(--border-color)' }}>Editar</button>
                          <button onClick={() => { handleDelete(item.id); setMenuAbertoId(null); }} className="action-menu-button" style={{ color: 'var(--error-color)' }}>Excluir</button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )})}
            </ul>
            )}
          </div>
        </div>

        {/* Coluna Saídas */}
        <div style={{ flex: '1 1 400px', height: '550px', display: 'flex', flexDirection: 'column', padding: '0 0.5rem' }}>
          <h3 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '0.5rem', marginBottom: '1.5rem', flexShrink: 0 }}>Total de Saídas</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {transacoes.length === 0 ? (
              <p style={{textAlign:'center', color: 'var(--text-secondary)'}}>Nenhuma saída registrada.</p>
            ) : (
              <ul className="expense-list">
              {transacoes.map((item, index) => {
                const openUp = index >= transacoes.length - 2 && transacoes.length > 2;
                return (
                <li 
                  key={item.id} 
                  className="expense-item"
                  style={{ borderLeft: `6px solid ${CATEGORY_COLORS[item.categoria] || '#ccc'}`, padding: '0.8rem 1rem', position: 'relative' }}
                >
                  <div className="expense-info" style={{ flexGrow: 1 }}>
                    <strong>{item.descricao}</strong>
                    <span className="expense-date">
                      {new Date(item.date).toLocaleDateString('pt-BR')} • <span style={{color: CATEGORY_COLORS[item.categoria], fontWeight: 500}}>{item.categoria}</span>
                    </span>
                  </div>
                  <div className="expense-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="expense-value" style={{ color: '#ef4444' }}>
                      - {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <div className="action-menu-container">
                      <button onClick={() => setMenuAbertoId(prev => prev === item.id ? null : item.id)} className="action-menu-trigger" title="Opções">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                        </svg>
                      </button>
                      {menuAbertoId === item.id && (
                        <div className={`action-menu ${openUp ? 'up' : ''}`}>
                          <button onClick={() => { handleEdit(item); setMenuAbertoId(null); }} className="action-menu-button" style={{ borderBottom: '1px solid var(--border-color)' }}>Editar</button>
                          <button onClick={() => { handleDelete(item.id); setMenuAbertoId(null); }} className="action-menu-button" style={{ color: 'var(--error-color)' }}>Excluir</button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              )})}
            </ul>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}