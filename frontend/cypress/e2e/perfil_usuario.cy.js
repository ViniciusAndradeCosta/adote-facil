describe('História de Usuário: Edição de Dados Pessoais', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[name="email"]').type('abcdefg@gmail.com');
    cy.get('input[type="password"]').type('123456789');
    cy.contains('button', 'Login').click();
    cy.url().should('include', '/area_logada');
    cy.visit('http://localhost:3000/area_logada/editar_dados');
  });

  it('Deve permitir que o usuário altere seu nome com sucesso', () => {
    const novoNome = `Alterado`;
    // Primeiro, limpa o campo.
    cy.get('input[name="name"]').clear();
    // Depois, encontra o campo novamente e digita o novo nome.
    cy.get('input[name="name"]').type(novoNome);

    cy.contains('button', 'Salvar alterações').click();
    //cy.contains('Dados editados com sucesso').should('be.visible');
    cy.get('input[name="name"]').should('have.value', novoNome);
  });
});

