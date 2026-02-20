# Análise DevOps e Sugestões de Melhoria - Adote Fácil

### 1. Análise do Pipeline CI/CD

O projeto implementa um pipeline CI/CD com 4 jobs principais no seguinte fluxo:

```
Pull Request → Checkout → Unit Tests → Build Docker → Up Containers → Delivery
```

#### **Job 1: Unit Tests**
- Instala dependências do backend Executa testes com Jest.
- Gera relatórios de cobertura

#### **Job 2: Build**
- Configura Docker Buildx e QEMU
- Faz build das imagens Docker

#### **Job 3: Up Containers**
- Sobe os containers em segundo plano
- Aguarda 10 segundos
- Encerra os containers após o teste

#### **Job 4: Delivery**
- Compacta todos os arquivos do repositório, exceto pastas desnecessárias
- Faz upload como artefato

### 1.1 Análise de Qualidade do Pipeline
- **Testes Unitários** Foram Implementados com Jest
- **Build Docker**  Usa Buildx para multiplataforma
- **Testes de Integração**  Apenas sobe containers, sem testes
- **Segurança**  Sem scanning de vulnerabilidades
- **Performance**  Sem cache de dependências
- **Documentação**  Sem geração de documentação
- **Artefatos**  Upload de um arquivo copactado
- **Notificações**  Sem notificações de falha

## 2. Problemas Identificados

### 2.1 Problema 1: Falta de Cache de Dependências

**Problema**: O `npm install` sempre reinstala todas dependências do banck end 

```yaml
- name: Instalar dependências do backend
    run: |
        cd backend   # Acessa a pasta do backend
        npm install  # Reistala todas as dependências
```

**Solução**: Usar o cache de dependências de ci com `npm ci` e garante que as mesmas dependências do `package-lock.json`

```yaml
- name: Cache node modules # Cache de dependências
  uses: actions/cache@v3
  with: 
    path: |
      backend/node_modules
      frontend/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Instalar dependências do backend
  run: |
    cd backend
    npm ci  # Usa package-lock.json (mais rápido)
```

### 2.2 Problema 2: Falta de Testes de Integração

**Problema**: Sobe os contêineres sem testes de integração para garantia estão conseguindo comunicar-se corretamente
```yaml
#  Apenas sobe containers sem testes
- name: Subir containers com Docker Compose
  working-directory: ./backend
  run: |
    docker compose up -d
    sleep 10
    docker compose down  # Sem validação
```

**Solução**: Implementação de teste de integração
```yaml
#  Com testes de integração
- name: Subir containers com Docker Compose
  working-directory: ./backend
  run: |
    docker compose up -d
    sleep 10

- name: Executar testes de integração
  run: |
    # Aguardar API estar pronta
    npx wait-on http://localhost:8080/health --timeout 30000
    
    # Executar testes
    npm run test:integration

- name: Parar containers
  if: always()
  working-directory: ./backend
  run: docker compose down
```

### 2.3 Problema 3: Falta de Scanning de Segurança

**Problema**: Sem verificação de vulnerabilidades de dependências

**Solução**: Criação de scanning de segurança
```yaml
#  Adicionar scanning de segurança
- name: Executar npm audit
  run: |
    cd backend
    npm audit --production

- name: Executar Snyk
  uses: snyk/actions/node@master
  env:
    SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
  with:
    args: --severity-threshold=high
```

### 2.4 Problema4: Falta de Linting no Pipeline

**Problema**: ESLint não é executado no pipeline. 

**Solução**: O linting no pipeline ajuda a manter a qualidade do código ao forçar a aderência a padrões de codificação definidos, como estilo, formatação, e boas práticas.
```yaml
#  Adicionar linting
- name: Executar ESLint
  run: |
    cd backend
    npm run lint

- name: Executar Prettier
  run: |
    cd backend
    npm run format:check
```

### 2.5 Problema #5: Falta de Testes de Cobertura Mínima

**Problema**: Sem verificação de cobertura mínima.

**Solução**: Implemetação de uma cobertura mínima do código seja testada para garantir a qualidade do software e minimizar a chance de erros não detectados.
```yaml
#  Adicionar verificação de cobertura
- name: Executar testes com cobertura
  run: |
    cd backend
    npm run test:coverage

- name: Verificar cobertura mínima
  run: |
    cd backend
    npx nyc check-coverage --lines 80 --functions 80 --branches 80
```

### 2.6 Problema 6: Falta de Notificações

**Problema**: Sem notificações de sucesso/falha, dificultando a identificação rápida de falhas atrasando correções

**Solução**: Adicionar notificação caso aconteca alguma falha
```yaml
#  Adicionar notificações
- name: Notificar sucesso
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build e testes passaram com sucesso! '
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}

- name: Notificar falha
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Build ou testes falharam! '
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 3. Melhorias Propostas implementadas

### 3.1 Pipeline

```yaml
name: ci-cd-otimizado

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

jobs:
  # Job 1: Validação de Código
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: |
            backend/package-lock.json
            frontend/package-lock.json
      
      - name: Instalar dependências do backend
        run: cd backend && npm ci
      
      - name: Executar ESLint
        run: cd backend && npm run lint
      
      - name: Executar Prettier
        run: cd backend && npm run format:check
      
      - name: Executar npm audit
        run: cd backend && npm audit --production

  # Job 2: Testes Unitários
  unit-tests:
    runs-on: ubuntu-latest
    needs: validate
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Instalar dependências
        run: cd backend && npm ci
      
      - name: Executar testes unitários
        run: cd backend && npm test -- --coverage
      
      - name: Verificar cobertura mínima
        run: cd backend && npx nyc check-coverage --lines 80 --functions 80 --branches 80
      
      - name: Upload cobertura para Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/coverage-final.json
          flags: unittests

  # Job 3: Build Docker
  build:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Setup QEMU
        uses: docker/setup-qemu-action@v2
      
      - name: Build Docker images
        run: docker compose build

  # Job 4: Testes de Integração
  integration-tests:
    runs-on: ubuntu-latest
    needs: build
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: adote_facil_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Instalar dependências
        run: cd backend && npm ci
      
      - name: Setup banco de dados
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/adote_facil_test
        run: cd backend && npm run migrate:test
      
      - name: Executar testes de integração
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/adote_facil_test
        run: cd backend && npm run test:integration

  # Job 5: Segurança
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Instalar dependências
        run: cd backend && npm ci
      
      - name: Executar Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # Job 6: Notificações
  notify:
    runs-on: ubuntu-latest
    needs: [validate, unit-tests, build, integration-tests, security]
    if: always()
    steps:
      - name: Notificar sucesso
        if: success()
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: 'Pipeline CI/CD passou com sucesso! '
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notificar falha
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: 'Pipeline CI/CD falhou! '
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 3.2 Dockerfile

**Arquivo**: `backend/Dockerfile`

```dockerfile
#  Dockerfile atual (não otimizado)
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]

#  Dockerfile otimizado (multi-stage)
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 8080
USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
```

### 3.3 Docker Compose Melhorado

**Arquivo**: `docker-compose.yml`

```yaml
#  Atual
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: adote_facil
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "6500:5432"

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

#  Melhorado
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: adote-facil-postgres
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "${POSTGRES_CONTAINER_PORT}:${POSTGRES_PORT}"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - adote-facil-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: adote-facil-backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - adote-facil-network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: adote-facil-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - adote-facil-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  adote-facil-network:
    driver: bridge
```

## 4. Implementação de Monitoramento

### 4.1 Health Checks

```typescript
// src/health.ts
import { Router, Request, Response } from 'express'
import { prisma } from './database.js'

const healthRouter = Router()

healthRouter.get('/health', async (req: Request, res: Response) => {
  try {
    // Verificar conexão com banco de dados
    await prisma.$queryRaw`SELECT 1`
    
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    })
  } catch (error) {
    return res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    })
  }
})

export { healthRouter }
```

### 4.2 Métricas

```typescript
// src/metrics.ts
import { Router, Request, Response } from 'express'

const metricsRouter = Router()

let requestCount = 0
let errorCount = 0

metricsRouter.get('/metrics', (req: Request, res: Response) => {
  return res.status(200).json({
    requests: requestCount,
    errors: errorCount,
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  })
})

export { metricsRouter }
```

## 5. Conclusão

As melhorias propostas no pipeline DevOps aumentarão significativamente a qualidade, segurança e confiabilidade da aplicação. A implementação gradual dessas sugestões resultará em:

-  Builds mais rápidos (cache)
-  Melhor qualidade de código (linting, testes)
-  Segurança melhorada (scanning)
-  Melhor observabilidade (logs, métricas)
-  Maior confiabilidade (health checks)
