describe('Histórias de Usuário: HU-3 (Cadastro) e HU-4 (Visualização de Animais)', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type('abcdefg@gmail.com');
    cy.get('input[type="password"]').type('123456789');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/area_logada');
  });

  it('HU-04: Deve exibir a mensagem de estado vazio ao acessar "Meus Animais" sem nenhum pet cadastrado', () => {
    cy.visit('http://localhost:3000/area_logada/meus_animais');
    cy.get('h1').contains('Meus animais disponíveis para adoção').should('be.visible');
    cy.contains('Você ainda não cadastrou nenhum animal para adoção').should('be.visible');
  });

  it('HU-03: Deve permitir o cadastro completo de um novo animal, incluindo a foto', () => {
    cy.visit('http://localhost:3000/area_logada/disponibilizar_animal');
    const nomeAnimal = `Caramelo Totó`;

    cy.get('input[name="name"]').type(nomeAnimal);

    // 1. Interage com o botão de "Tipo"
    cy.get('button[role="combobox"]').first().click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').contains('Cachorro').click({ force: true });
    // Busca o elemento novamente antes de verificar, para pegar a referência atualizada
    cy.get('button[role="combobox"]').first().should('contain.text', 'Cachorro');

    // 2. Interage com o botão de "Gênero"
    cy.get('button[role="combobox"]').eq(1).should('be.visible').click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').contains('Macho').click({ force: true });
    //Busca o elemento novamente em vez de usar a variável 'generoButton'
    cy.get('button[role="combobox"]').eq(1).should('contain.text', 'Macho');

    // 3. Continua preenchendo o resto do formulário
    cy.get('input[name="race"]').type('Vira-Lata Caramelo');
    cy.get('textarea[name="description"]').type('O vira-lata caramelo é o cachorro mais brasileiro que existe.');

    // 4. Faz o upload da foto obrigatória
    cy.get('input[type="file"]').attachFile('caramelo.png');

    // 5. Clica no botão para submeter o formulário
    cy.contains('button', 'Cadastrar').click();

    // 6. VERIFICAÇÕES FIM
    cy.url().should('include', '/area_logada/meus_animais');
    cy.contains('Você ainda não cadastrou nenhum animal para adoção').should('not.exist');
    cy.contains(nomeAnimal).should('be.visible');
  });
});