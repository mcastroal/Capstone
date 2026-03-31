describe('Public pages smoke test', () => {
  it('loads home page', () => {
    cy.visit('/');
    cy.contains('NakPath').should('be.visible');
  });

  it('loads login page', () => {
    cy.visit('/login');
    cy.contains('Welcome back').should('be.visible');
    cy.get('button[type="submit"]').contains('Login').should('be.visible');
  });

  it('shows register validation error inline', () => {
    cy.visit('/register');
    cy.get('input[placeholder="First Name"]').type('Test');
    cy.get('input[placeholder="Last Name"]').type('User');
    cy.get('input[placeholder="Email"]').type('invalid-email');
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('button[type="submit"]').contains('Register').click();
    cy.contains('Enter a valid email with "@" and a domain').should('be.visible');
  });
});
