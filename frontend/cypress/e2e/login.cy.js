// Descreve o conjunto de testes para a funcionalidade de Login
describe('História de Usuário: Login na Plataforma', () => {

  // O bloco beforeEach é executado antes de cada teste ('it') deste conjunto
  beforeEach(() => {
    // Visita a página de login
    cy.visit('http://localhost:3000/login');
  });

  // Teste para o cenário de login com sucesso
  it('Deve redirecionar para a área logada com credenciais válidas', () => {
    // 1. Encontra o campo de email pelo atributo 'name' e digita um email válido
    cy.get('input[name="email"]').type('abcdefg@gmail.com');

    // 2. Encontra o campo de senha pelo atributo 'type' e digita uma senha válida
    cy.get('input[type="password"]').type('123456789');

    // 3. Encontra o botão que contém o texto "Login" e clica nele
    cy.contains('button', 'Login').click();

    // 4. Confirma que a URL agora inclui o caminho da área logada
    cy.url().should('include', '/area_logada/animais_disponiveis');

    // 5. Verifica se a mensagem de texto da nova página está visível para confirmar o sucesso
    cy.get('h1').contains('Animais disponíveis para adoção').should('be.visible');
  });

  // Teste para o cenário de login com falha
  it('Deve exibir um alerta de erro com credenciais inválidas', () => {
    // 1. Prepara o Cypress para capturar o próximo alerta do navegador
    cy.on('window:alert', (alertText) => {
      // Assim que o alerta aparecer, verifica se o texto dele é o esperado
      expect(alertText).to.equal('Email ou senha inválidos.');
    });

    // 2. Preenche o formulário com dados inválidos
    cy.get('input[name="email"]').type('usuario@invalido.com');
    cy.get('input[type="password"]').type('senhaErrada123');

    // 3. Clica no botão de login, o que deve disparar o alerta que o Cypress está capturando
    cy.contains('button', 'Login').click();
  });
});