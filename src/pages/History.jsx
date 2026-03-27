import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_COLORS } from '../services/storage';
import { supabase } from '../supabaseClient';

export default function History() {
  const [transacoes, setTransacoes] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const navigate = useNavigate();
  
  // Usando useCallback para memorizar a função carregarDados e evitar recriações desnecessárias
  const carregarDados = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Erro ao buscar histórico:', error.message);
        // Opcional: Exibir uma mensagem de erro para o usuário
        // alert('Não foi possível carregar o histórico. Tente novamente.');
      } else if (data) {
        setTransacoes(data.filter(t => t.tipo === 'saida'));
        setEntradas(data.filter(t => t.tipo === 'entrada'));
      }
    } catch (err) {
      console.error('Erro inesperado ao carregar dados:', err);
    }
  }, []); // Dependências vazias, pois não depende de nenhum estado ou prop

  useEffect(() => {
    carregarDados();
  }, [carregarDados]); // Adiciona carregarDados como dependência

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      const { error } = await supabase.from('transactions').delete().eq('id', id); //
      if (error) console.error('Erro ao excluir lançamento:', error.message); //
      carregarDados();
    }
  }, [carregarDados]); // Depende de carregarDados

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
        <div style={{ flex: '1 1 400px' }}>
          <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Total de Entradas</h3>
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
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="expense-actions">
                    <span className="expense-value" style={{ color: '#10b981' }}>
                      + {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }} title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} title="Excluir">
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coluna Saídas */}
        <div style={{ flex: '1 1 400px' }}>
          <h3 style={{ borderBottom: '2px solid #ef4444', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>Total de Saídas</h3>
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
                      {new Date(item.date).toLocaleDateString('pt-BR')} • <span style={{color: CATEGORY_COLORS[item.categoria], fontWeight: 500}}>{item.categoria}</span>
                    </span>
                  </div>
                  <div className="expense-actions">
                    <span className="expense-value" style={{ color: '#ef4444' }}>
                      - {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <button onClick={() => handleEdit(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }} title="Editar">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }} title="Excluir">
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </main>
  );
}