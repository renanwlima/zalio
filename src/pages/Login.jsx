import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


export default function Login(){
  // O useState é necessário para gerenciar o estado dos campos de login, senha e mensagens de erro, permitindo que a interface do usuário seja atualizada dinamicamente com base nas interações do usuário. Sem o useState, não seria possível armazenar e atualizar essas informações, o que resultaria em uma experiência de usuário estática e limitada.
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
 // O useNavigate é necessário para redirecionar o usuário após um login bem-sucedido, por exemplo, para a página inicial ou para a página de primeiro acesso. Ele é uma função fornecida pelo React Router que permite navegar programaticamente para diferentes rotas dentro da aplicação. Sem o useNavigate, não seria possível redirecionar o usuário de forma eficiente após o login, o que poderia resultar em uma experiência de usuário confusa e dificultar a navegação dentro da aplicação.
  const nav = useNavigate(); 


  // A função onSubmit é responsável por lidar com o evento de envio do formulário de login, realizando a autenticação do usuário e redirecionando-o para a página apropriada com base no resultado da autenticação. Ela é necessária para processar as informações de login fornecidas pelo usuário, verificar sua validade e determinar se o acesso deve ser concedido ou negado. Sem a função onSubmit, o formulário de login não teria funcionalidade, e os usuários não seriam capazes de autenticar-se ou acessar as áreas protegidas da aplicação.
  async function onSubmit(e){
    // O e.preventDefault() é necessário para evitar que o formulário seja enviado de forma tradicional, o que causaria um recarregamento da página. 
    // Ele permite que a função onSubmit processe as informações do formulário e realize as validações necessárias sem interromper a experiência do usuário. 
    // Sem o e.preventDefault(), o comportamento padrão do formulário seria acionado, resultando em uma experiência de usuário confusa e dificultando a implementação de validações personalizadas ou ações adicionais após o envio do formulário.
    // O método event.preventDefault() no JavaScript é utilizado para cancelar o comportamento padrão de um elemento HTML quando um evento ocorre. Ele impede que o navegador execute a ação nativa, como carregar uma nova página ao clicar em um link ou enviar um formulário. 
    e.preventDefault(); 
    setErro('');
    try{
      // Simulação de autenticação, substitua pela lógica real de autenticação
      // Neste exemplo, estamos verificando se o login e a senha correspondem a "admin". Se forem válidos, simulamos uma resposta do servidor indicando se é o primeiro acesso ou não. Com base nessa resposta, redirecionamos o usuário para a página de primeiro acesso ou para a página inicial.
      if(login === 'admin' && senha === 'admin'){
        // Simulação de resposta do servidor indicando se é o primeiro acesso
         // Neste exemplo, estamos assumindo que o usuário "admin" tem um campo "primeiroAcesso" que indica se é o primeiro acesso ou não. Com base nesse campo, redirecionamos o usuário para a página de primeiro acesso ou para a página inicial.
        const u = { primeiroAcesso: true };  
        // O nav é usado para redirecionar o usuário para a página de primeiro acesso se for o primeiro acesso, ou para a página inicial caso contrário. Ele é necessário para garantir que os usuários sejam direcionados para a página correta com base em seu status de acesso, proporcionando uma experiência de usuário personalizada e eficiente. Sem o nav, os usuários não seriam redirecionados corretamente, o que poderia resultar em confusão e dificultar a navegação dentro da aplicação. 
        nav(u.primeiroAcesso ? '/first-access' : '/');
      }
      else{ 
        throw new Error('Login ou senha inválidos'); 
      }
    }catch(err){
       // O setErro é usado para atualizar o estado de erro com a mensagem de erro apropriada quando a autenticação falha, permitindo que a interface do usuário exiba feedback relevante para o usuário. Ele é necessário para informar os usuários sobre problemas de autenticação, como credenciais inválidas, e para melhorar a experiência do usuário ao fornecer informações claras sobre o motivo da falha. Sem o setErro, os usuários não receberiam feedback adequado sobre os erros de autenticação, o que poderia resultar em frustração e dificultar a resolução de problemas.
       setErro(err.message); 
    }
  }
  // O return é responsável por renderizar a interface do usuário do componente de login, incluindo os campos de entrada para login e senha, o botão de envio e a exibição de mensagens de erro. Ele é necessário para fornecer uma interface interativa para os usuários inserirem suas credenciais e receberem feedback sobre o status do login. Sem o return, o componente não renderizaria nada na tela, tornando impossível para os usuários interagirem com o formulário de login ou receberem informações sobre erros de autenticação.
  return (
    <main className="container" aria-labelledby="ttlLogin">
      <h1 id="ttlLogin">Entrar</h1>
      <form onSubmit={onSubmit} className="grid">
        <label htmlFor="lg">Login</label>
        <input id="lg" value={login} onChange={e=>setLogin(e.target.value)} required />
        <label htmlFor="pw">Senha</label>
        <input id="pw" type="password" value={senha} onChange={e=>setSenha(e.target.value)} required />
        {erro && <div role="alert" className="error">{erro}</div>}
        <button type="submit">Acessar</button>
      </form>
    </main>
  );
}
