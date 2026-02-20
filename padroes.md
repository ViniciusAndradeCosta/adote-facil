# Análise de Princípios SOLID e Padrões de Projeto - Adote Fácil
## 1. Princípios SOLID
### 1.1 Single Responsibility Principle
>**Definição**: Uma classe deve ter apenas uma razão para mudar, ou seja, apenas uma responsabilidade.
####  Implementação
**Separação entre Controller e Service**

```typescript
// Controller
class CreateUserController {
  constructor(private readonly createUser: CreateUserService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    const { name, email, password } = request.body

    try {
      const result = await this.createUser.execute({ name, email, password })

      const statusCode = result.isFailure() ? 400 : 201

      return response.status(statusCode).json(result.value)
    } catch (err) {
      const error = err as Error
      console.log({ error })
      return response.status(500).json({ error: error.message })
    }
  }
}
// Service
class CreateUserService {
  constructor(
    private readonly encrypter: Encrypter,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: CreateUserDTO.Params): Promise<CreateUserDTO.Result> {
    const { name, email, password } = params

    const userAlreadyExists = await this.userRepository.findByEmail(email)

    if (userAlreadyExists) {
      return Failure.create({ message: 'Email já cadastrado.' })
    }

    const hashedPassword = this.encrypter.encrypt(password)

    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    })

    return Success.create(user)
  }
}
// Repository
class UserRepository {
  constructor(private readonly repository: PrismaClient) {}

  async create(
    params: CreateUserRepositoryDTO.Params,
  ): Promise<CreateUserRepositoryDTO.Result> {
    return this.repository.user.create({ data: params })
  }

  async update(params: UpdateUserRepositoryDTO.Params) {
    return this.repository.user.update({
      where: { id: params.id },
      data: params.data,
    })
  }

  async findById(id: string) {
    return this.repository.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string) {
    return this.repository.user.findUnique({ where: { email } })
  }
}
```
**Responsabilidades Separadas**:
- **Controller**: Receber requisição, chamar serviço, retornar resposta
- **Service**: Orquestrar lógica de negócio, validações
- **Repository**: Acesso ao banco de dados
## 2. Padrões de Projeto Implementados

### 2.1 Singleton 

**Implementação**: Instância do autenticator no arquivo "autenticator.ts" é exportada como uma única instância garantindo que apenas um objeto de autenticação seja utilizado em toda a aplicação, centralizando o controle e o estado

```typescript
// auntenticator.ts
export class Authenticator {
  // código //
}
// instância
export const authenticatorInstance = new Authenticator()

// import
import { Authenticator } from '../authenticator.js'

// Uso da instância
authenticator.generateToken.mockReturnValue('token')
```
### 2.2 Dependency Injection

**Implementação**: A injeção de dependência a classe recebe suas dependencias de fora ao inves de criá-las

```typescript
class CreateUserService {
  // Recebe suas dependências e não as cria.
  constructor(
    private readonly encrypter: Encrypter,
    private readonly userRepository: UserRepository,
  ) {}
  
  async execute(params: CreateUserDTO.Params): Promise<CreateUserDTO.Result> {
    // Implementação
  }
}
```
### 2. Padrão Repository

>**Definição**: O padrão repository abstrai a camada de acesso a dados, separando a lógica de negócio das interações diretas com o banco de dados. A estrutura do projeto inclui uma pasta repositories as classes de serviços que dependem dos repositórios para passar e recuperar dados sem conhecer a sua implementação.
####  Implementação
**Separação entre UserService e userRepository**
```typescript

// Service
export class CreateUserService {
  // Construtores
  async execute(params: CreateUserDTO.Params): Promise<CreateUserDTO.Result> {
    // Código
    // Uso da repository
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    })
    return Success.create(user)
  }
}

// Repository
export class UserRepository {
  constructor(private readonly repository: PrismaClient) {}

  async create(
    params: CreateUserRepositoryDTO.Params,
  ): Promise<CreateUserRepositoryDTO.Result> {
    return this.repository.user.create({ data: params })
  }
  // Restante do código
}
```