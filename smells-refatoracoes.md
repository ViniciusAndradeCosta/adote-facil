# Análise de Code Smells e Refatorações - Adote Fácil

## 1. Code Smells Identificados e Refatorações

### 1.1 Duplicação de Lógica de Tratamento de Erros

**Problema Identificado**:

```typescript
// src/controllers/user/create-user.ts
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

```

**Refatoração Proposta**:

```typescript
// src/utils/controller-helper.ts
export class ControllerHelper {
  static handleServiceResult<T>(
    result: Either<{ message: string }, T>,
    successStatusCode: number = 201,
  ): { status: number; body: any } {
    const status = result.isFailure() ? 400 : successStatusCode
    return { status, body: result.value }
  }
  
  static handleError(error: Error): { status: number; body: any } {
    console.error('Controller error:', error)
    return {
      status: 500,
      body: { error: error.message },
    }
  }
}

// src/controllers/user/create-user.ts (Refatorado)
async handle(request: Request, response: Response): Promise<Response> {
  try {
    const { name, email, password } = request.body
    const result = await this.createUser.execute({ name, email, password })
    
    const { status, body } = ControllerHelper.handleServiceResult(result, 201)
    return response.status(status).json(body)
  } catch (err) {
    const error = err as Error
    const { status, body } = ControllerHelper.handleError(error)
    return response.status(status).json(body)
  }
}

```
---

### 2.2 Falta de Validação de Entrada

**Localização**: Controllers (múltiplos arquivos)

**Problema Identificado**:

```typescript
// src/controllers/user/create-user.ts
async handle(request: Request, response: Response): Promise<Response> {
  const { name, email, password } = request.body  //  Sem validação
  
  try {
    const result = await this.createUser.execute({ name, email, password })
    // ...
  }
}

```

**Tipo de Smell**: Validação Ausente

**Refatoração Proposta**:

```typescript
// src/utils/validators.ts
import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const CreateAnimalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.string().min(2, 'Tipo deve ser especificado'),
  gender: z.enum(['Macho', 'Fêmea']),
  race: z.string().optional(),
  description: z.string().optional(),
})

export const UpdateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
})

// src/controllers/user/create-user.ts (Refatorado)
async handle(request: Request, response: Response): Promise<Response> {
  try {
    // Validação de entrada
    const validationResult = CreateUserSchema.safeParse(request.body)
    
    if (!validationResult.success) {
      return response.status(400).json({
        error: 'Validação falhou',
        details: validationResult.error.errors,
      })
    }
    
    const { name, email, password } = validationResult.data
    const result = await this.createUser.execute({ name, email, password })
    
    const { status, body } = ControllerHelper.handleServiceResult(result, 201)
    return response.status(status).json(body)
  } catch (err) {
    const error = err as Error
    const { status, body } = ControllerHelper.handleError(error)
    return response.status(status).json(body)
  }
}

```
---

### 2.3 Code Smell #3: Logging Inconsistente

**Problema Identificado**:

```typescript
// src/providers/authenticator.ts
validateToken<T = object>(token: string): T | null {
  const secret = process.env.JWT_SECRET || 'secret'
  
  try {
    return jwt.verify(token, secret) as T
  } catch (err) {
    const error = err as Error
    console.log({ error })  //  Logging inconsistente
    return null
  }
}

```

**Refatoração Proposta**:

```typescript
// src/utils/logger.ts
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Logger {
  private static formatLog(level: LogLevel, message: string, context?: any): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level}] ${message}${contextStr}`
  }
  
  static debug(message: string, context?: any): void {
    console.debug(this.formatLog(LogLevel.DEBUG, message, context))
  }
  
  static info(message: string, context?: any): void {
    console.info(this.formatLog(LogLevel.INFO, message, context))
  }
  
  static warn(message: string, context?: any): void {
    console.warn(this.formatLog(LogLevel.WARN, message, context))
  }
  
  static error(message: string, error?: Error, context?: any): void {
    const errorContext = {
      ...context,
      errorMessage: error?.message,
      errorStack: error?.stack,
    }
    console.error(this.formatLog(LogLevel.ERROR, message, errorContext))
  }
}

// src/providers/authenticator.ts (Refatorado)
import { Logger } from '../utils/logger.js'

validateToken<T = object>(token: string): T | null {
  const secret = process.env.JWT_SECRET || 'secret'
  
  try {
    return jwt.verify(token, secret) as T
  } catch (err) {
    const error = err as Error
    Logger.warn('Token validation failed', { token: token.substring(0, 20) + '...' })
    return null
  }
}

```
---

