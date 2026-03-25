import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_COLORS } from '../services/storage';
import { supabase } from '../supabaseClient';

export default function History() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      console.error('Erro ao buscar histórico:', error);
    } else if (data) {
      setTransacoes(data.filter(t => t.tipo === 'saida'));
      setEntradas(data.filter(t => t.tipo === 'entrada'));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (!error) carregarDados();
    }
  };

  const handleEdit = (item) => {
    if (item.tipo === 'entrada') {
      navigate('/adicionar-entrada', { state: { transaction: item } });
    } else {
      navigate('/adicionar-saida', { state: { transaction: item } });
    }
  };

  return (
    <main className="container" style={{ maxWidth: '1250px', padding: '1rem 2rem 2rem' }}>
      <h2 style={{textAlign: 'center', margin: '0 0 2rem 0'}}>Histórico de Lançamentos</h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'stretch' }}>
        
        {/* Coluna Entradas */}
        <div className="dashboard-card" style={{ flex: '1 1 500px', padding: '1.5rem 2rem', margin: 0, height: '620px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '0.8rem', marginBottom: '1.5rem', marginTop: 0, flexShrink: 0 }}>Total de Entradas</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {entradas.length === 0 ? (
              <p style={{textAlign:'center', color: 'var(--text-secondary)'}}>Nenhuma entrada registrada.</p>
            ) : (
              <ul className="expense-list">
              {entradas.map((item) => (
                <li 
                  key={item.id} 
                  className="expense-item"
                  style={{ borderLeft: `6px solid #10b981` }}
                >
                  <div className="expense-info">
                    <strong>{item.descricao}</strong>
                    <span className="expense-date">
                      {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </span>
                  </div>
                  <div className="expense-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="expense-value" style={{ color: '#10b981', fontWeight: 'bold' }}>
                      + {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>

        {/* Coluna Saídas */}
        <div className="dashboard-card" style={{ flex: '1 1 500px', padding: '1.5rem 2rem', margin: 0, height: '620px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '0.8rem', marginBottom: '1.5rem', marginTop: 0, flexShrink: 0 }}>Total de Saídas</h3>
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
            {transacoes.length === 0 ? (
              <p style={{textAlign:'center', color: 'var(--text-secondary)'}}>Nenhuma saída registrada.</p>
            ) : (
              <ul className="expense-list">
              {transacoes.map((item) => (
                <li 
                  key={item.id} 
                  className="expense-item"
                  style={{ borderLeft: `6px solid ${CATEGORY_COLORS[item.categoria] || '#ccc'}` }}
                >
                  <div className="expense-info">
                    <strong>{item.descricao}</strong>
                    <span className="expense-date">
                      {new Date(item.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • <span style={{color: CATEGORY_COLORS[item.categoria], fontWeight: 500}}>{item.categoria}</span>
                    </span>
                  </div>
                  <div className="expense-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="expense-value" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                      - {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>

      </div>
    </main>
  );
}