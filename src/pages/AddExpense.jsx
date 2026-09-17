import { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CATEGORIAS, CATEGORY_COLORS } from '../services/storage';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';
import { useData } from '../contexts/DataContext';
import { IconCreditCard, IconCategory } from '../components/Icons';

export default function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth0();
  const { carregarTudo } = useData();
  const transacaoEditada = location.state?.transaction;

  const [form, setForm] = useState({
    descricao: transacaoEditada?.descricao || '',
    valor: transacaoEditada?.valor || '',
    categoria: transacaoEditada?.categoria || CATEGORIAS[0],
    data: transacaoEditada?.date || new Date().toISOString().split('T')[0]
  });
  const [salvando, setSalvando] = useState(false);

  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const selectCategory = (cat) => {
    setForm(prev => ({ ...prev, categoria: cat }));
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;
    setSalvando(true);

    const payload = {
      descricao: form.descricao.trim(),
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      date: form.data,
      tipo: 'saida',
      user_id: user?.sub
    };

    const { error } = transacaoEditada
      ? await supabase.from('transactions').update(payload).eq('id', transacaoEditada.id)
      : await supabase.from('transactions').insert([payload]);

    setSalvando(false);
    if (error) {
      alert('Erro ao salvar o gasto: ' + error.message);
      return;
    }
    carregarTudo();
    navigate('/');
  }, [form, transacaoEditada, navigate, user?.sub, carregarTudo]);

  return (
    <div className="container-focused">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--error-light)',
            color: 'var(--error-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconCreditCard size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', margin: 0, textAlign: 'left' }}>
              {transacaoEditada ? 'Editar Gasto' : 'Novo Gasto'}
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Lance compras, despesas pontuais ou contas
            </span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="btn-secondary" 
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
        >
          Voltar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid">
        <div>
          <label htmlFor="descricao">Descrição do Gasto</label>
          <input 
            id="descricao"
            name="descricao" 
            value={form.descricao} 
            onChange={handleChange} 
            placeholder="Ex: Mercado, Almoço, Gasolina, Farmácia..." 
            required 
            autoFocus
          />
        </div>
        
        <div>
          <label htmlFor="valor">Valor Gasto (R$)</label>
          <input 
            id="valor"
            name="valor" 
            type="number" 
            step="0.01" 
            value={form.valor} 
            onChange={handleChange} 
            placeholder="0.00" 
            min="0"
            required 
          />
        </div>

        <div>
          <label>Categoria</label>
          {/* Quick Selection Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
            {CATEGORIAS.map(cat => {
              const isSelected = form.categoria === cat;
              const color = CATEGORY_COLORS[cat] || '#6b7280';
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => selectCategory(cat)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${isSelected ? color : 'var(--border-color)'}`,
                    background: isSelected ? `${color}20` : 'var(--bg-subtle)',
                    color: isSelected ? color : 'var(--text-secondary)',
                    boxShadow: 'none',
                    margin: 0,
                    width: 'auto',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <IconCategory name={cat} size={13} color={isSelected ? color : 'var(--text-secondary)'} />
                  {cat}
                </button>
              );
            })}
          </div>

          <select name="categoria" value={form.categoria} onChange={handleChange} className="input-field">
            {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="data">Data do Gasto</label>
          <input id="data" name="data" type="date" value={form.data} onChange={handleChange} required />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={salvando}
            style={{ flex: 2, background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
          >
            {salvando ? 'Salvando...' : (transacaoEditada ? 'Atualizar Gasto' : 'Salvar Gasto')}
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="btn-secondary" 
            style={{ flex: 1 }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}