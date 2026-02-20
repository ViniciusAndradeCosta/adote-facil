describe('História de Usuário: HU-05 - Exclusão de Animal Cadastrado', () => {

  let nomeAnimalParaExcluir;

  beforeEach(() => {
    nomeAnimalParaExcluir = `Pet Para Excluir`;

    // --- Parte 1: Login ---
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type('abcdefg@gmail.com');
    cy.get('input[type="password"]').type('123456789');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/area_logada');

    // --- Parte 2: Cadastro do Animal (Pré-condição para o teste) ---
    cy.visit('http://localhost:3000/area_logada/disponibilizar_animal');
    cy.get('input[name="name"]').type(nomeAnimalParaExcluir);
    cy.get('button[role="combobox"]').first().click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').contains('Gato').click({ force: true });
    cy.get('button[role="combobox"]').eq(1).should('be.visible').click();
    cy.get('[role="listbox"]').should('be.visible');
    cy.get('[role="option"]').contains('Fêmea').click({ force: true });
    cy.get('input[name="race"]').type('Branco Aleatorio');
    cy.get('textarea[name="description"]').type('Uma gatinha muito calma e carinhosa.');
    cy.get('input[type="file"]').attachFile('gato.jpg');
    cy.contains('button', 'Cadastrar').click();
    cy.url().should('include', '/area_logada/meus_animais');
    cy.contains(nomeAnimalParaExcluir).should('be.visible');
  });

  it('HU-05: Deve permitir que o usuário exclua um animal com sucesso', () => {
    // --- CORREÇÃO DEFINITIVA: Usando a estratégia de filtro ---

    // 1. Pega todos os cards de animais da página.
    //    O seletor [class^="..."] significa "qualquer elemento cuja classe COMECE COM...".
    //    ATENÇÃO: Verifique no inspetor se o início da classe ('sc-d139caaf-0') é o mesmo para todos os cards.
    cy.get('[class^="sc-d13fbcaf-0 icsOqW"]')
      // 2. Filtra a lista de cards, mantendo apenas aquele que contém o nome do nosso animal.
      .filter(`:contains("${nomeAnimalParaExcluir}")`)
      // 3. Dentro DESSE card específico, encontra o último botão (o de exclusão).
      .find('button').last()
      // 4. Clica no botão.
      .click();

    // 5. O Cypress aceita confirmações (window.confirm) por padrão.

    // 6. VERIFICAÇÃO FINAL: Confirma que o animal com aquele nome não existe mais na página.
    cy.contains(nomeAnimalParaExcluir).should('not.exist');
  });
});