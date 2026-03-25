// Página de primeiro acesso, onde o usuário define sua senha pela primeira vez
import { useState } from 'react';
// O useNavigate é necessário para redirecionar o usuário após definir a senha, por exemplo, para a página inicial ou para a página de login
// Ele é uma função fornecida pelo React Router que permite navegar programaticamente para diferentes rotas dentro da aplicação
import { useNavigate } from 'react-router-dom';
 
// A função onSubmit é responsável por lidar com o evento de envio do formulário de primeiro acesso, realizando a validação das senhas e redirecionando o usuário para a página apropriada com base no resultado da validação. Ela é necessária para processar as informações de senha fornecidas pelo usuário, verificar se as senhas correspondem e determinar se o acesso deve ser concedido ou negado. Sem a função onSubmit, o formulário de primeiro acesso não teria funcionalidade, e os usuários não seriam capazes de definir suas senhas ou acessar as áreas protegidas da aplicação.
// O return é responsável por renderizar a interface do usuário do componente de primeiro acesso, incluindo os campos de entrada para senha e confirmação de senha, o botão de envio e a exibição de mensagens de erro. Ele é necessário para fornecer uma interface interativa para os usuários definirem suas senhas e receberem feedback sobre o status da validação. Sem o return, o componente não renderizaria nada na tela, tornando impossível para os usuários interagirem com o formulário de primeiro acesso ou receberem informações sobre erros de validação.  


export default function FirstAccess(){
  // O useState é necessário para gerenciar o estado dos campos de senha, confirmação de senha e mensagens de erro, permitindo que a interface do usuário seja atualizada dinamicamente com base nas interações do usuário. Sem o useState, não seria possível armazenar e atualizar essas informações, o que resultaria em uma experiência de usuário estática e limitada.
  const [senha, setSenha] = useState('');
  // O useState para confirmação de senha é necessário para armazenar o valor da confirmação de senha e permitir que a interface do usuário seja atualizada dinamicamente com base nas interações do usuário. Ele é essencial para validar se a senha e a confirmação de senha correspondem, garantindo que os usuários definam suas senhas corretamente. Sem o useState para confirmação de senha, não seria possível realizar essa validação, o que poderia resultar em senhas incorretas ou em uma experiência de usuário confusa.
  const [conf, setConf] = useState('');
  // O useState para mensagens de erro é necessário para armazenar e exibir mensagens de erro relevantes para os usuários durante o processo de definição de senha. Ele permite que a interface do usuário seja atualizada dinamicamente com base nas interações do usuário, fornecendo feedback claro sobre quaisquer problemas encontrados, como senhas que não correspondem ou critérios de senha não atendidos. Sem o useState para mensagens de erro, os usuários não receberiam feedback adequado sobre os erros de validação, o que poderia resultar em frustração e dificultar a resolução de problemas durante o processo de definição de senha.
  const [erro, setErro] = useState('');
  // O useNavigate é necessário para redirecionar o usuário após definir a senha, por exemplo, para a página inicial ou para a página de login. Ele é uma função fornecida pelo React Router que permite navegar programaticamente para diferentes rotas dentro da aplicação. Sem o useNavigate, não seria possível redirecionar o usuário de forma eficiente após definir a senha, o que poderia resultar em uma experiência de usuário confusa e dificultar a navegação dentro da aplicação.
  // O nav é usado para redirecionar o usuário para a página de login ou para a página inicial após definir a senha. Ele é necessário para garantir que os usuários sejam direcionados para a página correta com base em suas ações, proporcionando uma experiência de usuário personalizada e eficiente. Sem o nav, os usuários não seriam redirecionados corretamente, o que poderia resultar em confusão e dificultar a navegação dentro da aplicação.
  const nav = useNavigate();
 
  // A função onSubmit é responsável por lidar com o evento de envio do formulário de primeiro acesso, realizando a validação das senhas e redirecionando o usuário para a página apropriada com base no resultado da validação. Ela é necessária para processar as informações de senha fornecidas pelo usuário, verificar se as senhas correspondem e determinar se o acesso deve ser concedido ou negado. Sem a função onSubmit, o formulário de primeiro acesso não teria funcionalidade, e os usuários não seriam capazes de definir suas senhas ou acessar as áreas protegidas da aplicação.
  // Neste exemplo, a função onSubmit verifica se a senha e a confirmação de senha correspondem. Se não corresponderem, ela define uma mensagem de erro apropriada usando setErro. Se as senhas corresponderem, ela pode realizar ações adicionais, como salvar a senha no servidor ou redirecionar o usuário para a página de login ou para a página inicial usando nav.
  async function onSubmit(e){
    // O e.preventDefault() é necessário para evitar que o formulário seja enviado de forma tradicional, o que causaria um recarregamento da página. 
    // Ele permite que a função onSubmit processe as informações do formulário e realize as validações necessárias sem interromper a experiência do usuário. 
    // Sem o e.preventDefault(), o comportamento padrão do formulário seria acionado, resultando em uma experiência de usuário confusa e dificultando a implementação de validações personalizadas ou ações adicionais após o envio do formulário.
    // O método event.preventDefault() no JavaScript é utilizado para cancelar o comportamento padrão de um elemento HTML quando um evento ocorre. Ele impede que o navegador execute a ação nativa, como carregar uma nova página ao clicar em um link ou enviar um formulário. 
    e.preventDefault(); 
    // O setErro é usado para atualizar o estado de erro com a mensagem de erro apropriada quando a validação das senhas falha, permitindo que a interface do usuário exiba feedback relevante para o usuário. Ele é necessário para informar os usuários sobre problemas de validação, como senhas que não correspondem ou critérios de senha não atendidos, e para melhorar a experiência do usuário ao fornecer informações claras sobre o motivo da falha. Sem o setErro, os usuários não receberiam feedback adequado sobre os erros de validação, o que poderia resultar em frustração e dificultar a resolução de problemas durante o processo de definição de senha.
    // Neste exemplo, estamos realizando uma validação simples para verificar se a senha tem pelo menos 6 caracteres e se a senha e a confirmação de senha correspondem. Se a senha for muito curta ou se as senhas não corresponderem, definimos uma mensagem de erro apropriada usando setErro. Se as senhas forem válidas, redirecionamos o usuário para a página inicial usando nav.
    setErro('');
    if(senha.length < 6){ 
      setErro('A senha deve ter ao menos 6 caracteres'); 
      return; 
    }
    if(senha !== conf){ 
      setErro('Senhas não conferem. Digitar ambas iguais.'); 
      return; 
    }
    // Aqui você pode adicionar a lógica para salvar a senha no servidor ou realizar outras ações necessárias antes de redirecionar o usuário para a página de login ou para a página inicial. Neste exemplo, estamos simplesmente redirecionando o usuário para a página inicial usando nav.
    nav('/');


  }
  return (
    <main className="container">
      <h2>Defina sua senha</h2>
      <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem'}}>
        Para sua segurança, crie uma senha forte para o seu primeiro acesso ao Acervo Digital.
      </p>
      <form onSubmit={onSubmit} className="grid">
        <div>
          <label>Nova Senha</label>
          <input type="password" placeholder="Mínimo de 6 caracteres" value={senha} onChange={e=>setSenha(e.target.value)} required />
        </div>
        <div>
          <label>Confirmar senha</label>
          <input type="password" placeholder="Repita a senha" value={conf} onChange={e=>setConf(e.target.value)} required />
        </div>
        {erro && <div role="alert" className="error">{erro}</div>}
        <button>Salvar e continuar</button>
      </form>
    </main>
  );
}
