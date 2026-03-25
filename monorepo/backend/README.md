# Exam Manager

Sistema de criação e correção de provas com suporte a múltiplas versões e gabaritos.

---

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

---

## Como rodar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp monorepo/backend/.env.example monorepo/backend/.env
```

Edite o `.env` se necessário (os valores padrão já funcionam com o Docker abaixo).

### 3. Subir o banco de dados

```bash
docker compose up -d
```

### 4. Gerar o Prisma Client e aplicar migrations

```bash
cd monorepo/database
npx prisma generate
npx prisma migrate deploy
cd ../..
```

### 5. Rodar o backend

```bash
cd monorepo/backend
npm run start:dev
```

API disponível em `http://localhost:3000`
Swagger em `http://localhost:3000/docs`

---

## Estrutura do backend

O backend segue **Clean Architecture** com as camadas:

```
src/
├── shared/
│   ├── result.ts              # Result<T, E> para tratamento de erro sem exceptions
│   └── database/              # PrismaService (injeção do cliente do banco)
│
└── modules/
    ├── auth/                  # Login com JWT
    ├── users/                 # Cadastro de professores
    ├── students/              # Cadastro de alunos
    └── exams/
        ├── exam/              # Criação de provas
        ├── question/          # Questões com alternativas
        ├── versions/          # Versões embaralhadas de prova
        ├── keys/              # Gabarito por versão
        ├── student-answer/    # Respostas dos alunos
        ├── corrections/       # Correção (strict / lenient)
        └── grade/             # Notas geradas pela correção
```

Cada módulo segue o mesmo padrão interno:

```
<módulo>/
├── domain/           # Entidade e erros de domínio (sem frameworks)
├── application/
│   ├── ports/        # Interfaces dos repositórios (abstrações)
│   └── services/     # Casos de uso
├── infrastructure/
│   └── persistence/  # Implementação Prisma dos repositórios
└── presentation/
    └── http/         # Controller NestJS + DTOs
```

---

## Rotas disponíveis

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/users` | — | Cadastrar professor |
| `GET` | `/users/:id` | JWT | Buscar professor |
| `POST` | `/auth/login` | — | Login (retorna JWT) |
| `POST` | `/students` | — | Cadastrar aluno |
| `GET` | `/students/:id` | JWT | Buscar aluno |
| `POST` | `/questions` | JWT | Criar questão com alternativas |
| `GET` | `/questions` | JWT | Listar questões |
| `GET` | `/questions/:id` | JWT | Buscar questão |
| `POST` | `/exams` | JWT | Criar prova |
| `GET` | `/exams/:id` | JWT | Buscar prova |
| `POST` | `/exam-versions` | JWT | Criar versão (embaralha automaticamente) |
| `GET` | `/exam-versions` | JWT | Listar versões de uma prova (`?examId=`) |
| `GET` | `/exam-versions/:id` | JWT | Buscar versão |
| `POST` | `/answer-keys` | JWT | Registrar gabarito de uma versão |
| `GET` | `/answer-keys/exam-version/:id` | JWT | Buscar gabarito por versão |
| `POST` | `/student-answers` | JWT | Registrar respostas de um aluno |
| `POST` | `/corrections` | JWT | Criar correção (`strict` ou `lenient`) |
| `GET` | `/corrections/:id` | JWT | Buscar correção |
| `POST` | `/corrections/:id/apply` | JWT | Aplicar correção e gerar notas |
| `GET` | `/grades/exam-version/:id` | JWT | Notas por versão de prova |
| `GET` | `/grades/correction/:id` | JWT | Notas por correção |

---

## Modos de correção

| Modo | Comportamento |
|------|---------------|
| `strict` | Resposta do aluno deve ser idêntica ao gabarito |
| `lenient` | Resposta do aluno deve ser subconjunto válido do gabarito (aceita parcial sem marcar erradas) |

## Formatos de resposta

| Formato | Labels das alternativas | Exemplo de resposta |
|---------|------------------------|---------------------|
| `letters` | A, B, C, D… | `"AB"` |
| `powers_of_two` | 1, 2, 4, 8… | `"3"` (= 1+2) |
