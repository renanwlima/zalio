// Página de primeiro acesso, onde o usuário define sua senha pela primeira vez
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Importar supabase para autenticação
 
export default function FirstAccess(){
  const [senha, setSenha] = useState('');
  const [conf, setConf] = useState('');
  const [erro, setErro] = useState('');
  const nav = useNavigate();
 
  const handleSenhaChange = useCallback((e) => setSenha(e.target.value), []);
  const handleConfChange = useCallback((e) => setConf(e.target.value), []);

  const onSubmit = useCallback(async (e) => {
    e.preventDefault(); 
    setErro('');
    if(senha.length < 6){ 
      setErro('A senha deve ter ao menos 6 caracteres'); 
      return; 
    }
    if(senha !== conf){ 
      setErro('Senhas não conferem. Digitar ambas iguais.'); 
      return; 
    }

    try {
      // Exemplo de como você faria isso com Supabase Auth (se o usuário já estiver logado ou tiver um token de redefinição)
      // const { error } = await supabase.auth.updateUser({ password: senha });
      // if (error) {
      //   throw new Error(error.message);
      // }
      nav('/'); // Redireciona para a página inicial ou de login
    } catch (err) {
      console.error('Erro ao definir senha:', err.message);
      setErro('Erro ao definir senha: ' + err.message);
    }
  }, [senha, conf, nav]);

  return (
    <main className="container">
      <h2>Defina sua senha</h2>
      <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem'}}>
        Para sua segurança, crie uma senha forte para o seu primeiro acesso ao Acervo Digital.
      </p>
      <form onSubmit={onSubmit} className="grid">
        <div>
          <label>Nova Senha</label>
          <input type="password" placeholder="Mínimo de 6 caracteres" value={senha} onChange={handleSenhaChange} required />
        </div>
        <div>
          <label>Confirmar senha</label>
          <input type="password" placeholder="Repita a senha" value={conf} onChange={handleConfChange} required />
        </div>
        {erro && <div role="alert" className="error">{erro}</div>}
        <button>Salvar e continuar</button>
      </form>
    </main>
  );
}
