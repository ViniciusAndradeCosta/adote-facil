# 1. Gestão de Conta de Usuário
## HU-00: Cadastro de Usuário
Como um usuário sem cadastrado, eu quero fazer o cadastro na plataforma para que eu possa fazer login e funcionalidades do sistema.
### Cenários de Teste:
#### Cenário Principal (Sucesso):
Dado que o usuário está na página de Cadastro.
Quando ele insere um nome, e-mail, senha e confirmação de senha válidos e clica em "Cadastrar".
Então o sistema o cadastra, faz o login automático e o redireciona para a página de "Animais disponíveis para adoção".
#### Cenário Alternativo (e-mail Inválido):
Dado que o usuário está na página de Cadastro.
Quando ele insere um e-mail inválido (sem @ e sem o domínio seguido da extensão do domínio .com) e clica em "Cadastro".
Então o sistema exibe uma mensagem de erro informando que o e-mail é inválido.
#### Cenário Alternativo (Campos Vazios):
Dado que o usuário está na página de Cadastro.
Quando ele clica em "Cadastro" sem preencher os campos.
Então o sistema indica que os campos de nome, e-mail, senha e confirmação de senha são obrigatórios.
#### Cenário Alternativo (Quantidade de caracteres na senha):
Dado que o usuário está na página de Cadastro.
Quando ele clica em "Cadastro" com uma senha de menos de 8 caracteres.
Então o sistema indica que os campo senha tem que ter no mínimo 8 caracteres.
#### Cenário Alternativo (Confirmação de senha):
Dado que o usuário está na página de Cadastro.
Quando ele clica em "Cadastro" com uma senha não bate com a senha de confirmação.
Então o sistema indica que os campo senha e senha de confirmação devem ser os mesmos.
## HU-01: Login de Usuário
Como um usuário cadastrado, eu quero fazer login na plataforma para que eu possa acessar minhas informações e funcionalidades personalizadas.
Cenários de Teste:
### Cenário Principal (Sucesso):
Dado que o usuário está na página de login.
Quando ele insere um e-mail e senha válidos e clica em "Login".
Então o sistema o autentica e o redireciona para a página de "Animais disponíveis para adoção".
#### Cenário Alternativo (Credenciais Inválidas):
Dado que o usuário está na página de login.
Quando ele insere um e-mail ou senha inválidos e clica em "Login".
Então o sistema exibe uma mensagem de erro informando que as credenciais estão incorretas.
#### Cenário Alternativo (Campos Vazios):
Dado que o usuário está na página de login.
Quando ele clica em "Login" sem preencher os campos.
Então o sistema indica que os campos de e-mail e senha são obrigatórios.
## HU-02: Edição de Dados Pessoais
Como um usuário logado, eu quero editar meus dados pessoais (nome e email) para que minhas informações de contato se mantenham atualizadas.
### Cenários de Teste:
#### Cenário Principal (Sucesso):
Dado que o usuário está logado e na página "Editar dados pessoais".
Quando ele altera seu nome e clica em "Salvar alterações".
Então o sistema atualiza o nome do usuário e exibe uma mensagem de sucesso.

#### Cenário Alternativo (E-mail Inválido):
Dado que o usuário está logado e na página "Editar dados pessoais".
Quando ele insere um formato de email inválido e clica em "Salvar alterações".
Então o sistema exibe uma mensagem de erro indicando que o formato do e-mail é inválido.
#### Cenário Alternativo (Nome Inválido):
Dado que o usuário está logado e na página "Editar dados pessoais".
Quando ele insere um nome com caracteres especiais e clica em "Salvar alterações".
Então o sistema exibe uma mensagem de erro indicando que o campo nome não pode ter caracteres especiais.
## 2. Gestão de Animais
## HU-03: Cadastro de Animal para Adoção
Como um usuário logado, eu quero cadastrar um animal para adoção para que outras pessoas possam encontrá-lo e adotá-lo.
Cenários de Teste:
#### Cenário Principal (Sucesso):
Dado que o usuário está logado e na página "Disponibilizar animal para adoção".
Quando ele preenche todos os campos obrigatórios (Nome, Tipo, Gênero, Fotos) e clica em "Cadastrar".
Então o sistema salvo o novo animal e o redireciona para a página "Meus animais disponíveis para adoção", onde o novo animal é listado.
#### Cenário Alternativo (Campos Obrigatórios Vazios):
Dado que o usuário está na página de cadastro de animal.
Quando ele clica em "Cadastrar" sem preencher um ou mais campos obrigatórios.
Então o sistema exibe uma mensagem de erro indicando quais campos precisam ser preenchidos.
## HU-04: Visualização de Animais Cadastrados
Como um usuário logado, eu quero visualizar a lista dos meus animais que estão disponíveis para adoção para que eu possa gerenciar quem eu anunciei.
### Cenários de Teste:
#### Cenário Principal (Com Animais Cadastrados):
Dado que o usuário está logado e possui animais cadastrados.
Quando ele acessa a página "Meus animais disponíveis para adoção".
Então o sistema exibe uma lista com os animais que ele cadastrou.
#### Cenário Alternativo (Sem Animais Cadastrados):
Dado que o usuário está logado e não possui animais cadastrados.
Quando ele acessa a página "Meus animais disponíveis para adoção".
Então o sistema exibe a mensagem "Você ainda não cadastrou nenhum animal para adoção".

## HU-05: Exclusão de Animal Cadastrado
Como um usuário logado, eu quero excluir um animal que eu cadastrei para que ele não fique mais disponível para adoção na plataforma.

### Cenários de Teste:
#### Cenário Principal (Sucesso):

Dado que o usuário está logado e na página "Meus animais disponíveis para adoção", onde possui pelo menos um animal listado.
Quando ele encontra o animal que deseja remover e clica no botão "Excluir".
E confirma a exclusão (se houver uma etapa de confirmação).
Então o sistema remove o animal do banco de dados e a lista é atualizada, não exibindo mais o animal excluído.

#### Cenário Alternativo (Cancelamento):
Dado que o usuário está logado e na página "Meus animais".
Quando ele clica no botão "Excluir" de um animal.
E um pop-up de confirmação aparece, mas ele clica em "Cancelar".
Então a ação é cancelada e o animal permanece visível na lista.


## 3. Comunicação
## HU-06: Envio de Mensagem para Dono do Animal
Como um usuário interessado (Usuário A), eu quero enviar uma mensagem para o dono de um animal (Usuário B) para que eu possa iniciar o processo de adoção.
Cenários de Teste:
#### Cenário Principal (Sucesso - Iniciar Nova Conversa):
Dado que o Usuário A está logado e visualizando o perfil de um animal do Usuário B.
Quando ele escreve uma mensagem e clica em "Enviar".
Então o sistema cria um novo chat entre A e B, salva a mensagem e notifica o Usuário B. O Usuário A é redirecionado para a tela de "Minhas conversas".
#### Cenário Alternativo (Enviar Mensagem em Conversa Existente):
Dado que já existe uma conversa entre o Usuário A e o Usuário B.
Quando o Usuário A envia uma nova mensagem na conversa existente.
Então o sistema salvo a nova mensagem naquela conversa e notifica o Usuário B.
## HU-07: Visualização de Conversas
Como um usuário logado, eu quero visualizar minhas conversas para que eu possa acompanhar as negociações de adoção.
Cenários de Teste:
#### Cenário Principal (Com Conversas):
Dado que o usuário está logado e possui conversas ativas.
Quando ele acessa a página "Minhas conversas".
Então o sistema exibe uma lista de todas as suas conversas.
#### Cenário Alternativo (Sem Conversas):
Dado que o usuário está logado e nunca iniciou ou recebeu uma mensagem.
Quando ele acessa a página "Minhas conversas".
Então o sistema exibe uma tela vazia ou uma mensagem indicando que não há conversas.