import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth0();
  const [transacoes, setTransacoes] = useState([]);
  const [despesasFixas, setDespesasFixas] = useState([]);
  const [cofrinhos, setCofrinhos] = useState([]);
  const [dadosFinanceiros, setDadosFinanceiros] = useState([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true);

  const carregarTudo = useCallback(async () => {
    if (!user?.sub) return;
    setIsLoadingGlobal(true);
    try {
      const [resTransacoes, resFixas, resCofre, resDados] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.sub).order('date', { ascending: false }),
        supabase.from('despesas_fixas').select('*').eq('user_id', user.sub).order('vencimento', { ascending: true }),
        supabase.from('cofrinho').select('*').eq('user_id', user.sub).order('created_at', { ascending: true }),
        supabase.from('dados_financeiros').select('*').eq('user_id', user.sub).order('created_at', { ascending: false }).limit(1)
      ]);

      if (resTransacoes.data) setTransacoes(resTransacoes.data);
      if (resFixas.data) setDespesasFixas(resFixas.data);
      if (resCofre.data) setCofrinhos(resCofre.data);
      if (resDados.data) setDadosFinanceiros(resDados.data);
    } catch (err) {
      console.error('Erro ao carregar dados globais:', err);
    } finally {
      setIsLoadingGlobal(false);
    }
  }, [user?.sub]);

  useEffect(() => {
    if (isAuthenticated) {
      carregarTudo();
    }
  }, [isAuthenticated, carregarTudo]);

  return (
    <DataContext.Provider value={{ transacoes, despesasFixas, cofrinhos, dadosFinanceiros, isLoadingGlobal, carregarTudo }}>
      {children}
    </DataContext.Provider>
  );
};