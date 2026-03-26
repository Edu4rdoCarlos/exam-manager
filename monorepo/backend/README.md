# Backend — Exam Manager

NestJS + TypeScript. API disponível em `http://localhost:3001`, Swagger em `http://localhost:3001/docs`.

## Como rodar

```bash
# Na raiz do monorepo
npm install

# Banco de dados
docker compose up -d
cd monorepo/database && npx prisma generate && npx prisma migrate deploy && cd ../..

# Dev
cd monorepo/backend && npm run start:dev
```

Copie `monorepo/backend/.env.example` para `monorepo/backend/.env` antes de rodar.

## Estrutura

Segue **Clean Architecture** com separação estrita de camadas:

```
src/
├── shared/
│   ├── result.ts              # Result<T, E> para tratamento de erro sem exceptions
│   └── database/              # PrismaService
│
└── modules/
    ├── auth/                  # Login com JWT
    ├── users/                 # Professores
    ├── students/              # Alunos
    └── exams/
        ├── exam/              # Provas
        ├── question/          # Questões com alternativas
        ├── versions/          # Versões embaralhadas
        ├── keys/              # Gabaritos
        ├── student-answer/    # Respostas dos alunos
        ├── corrections/       # Correção (strict / lenient)
        └── grade/             # Notas
```

Cada módulo segue o padrão:

```
<módulo>/
├── domain/           # Entidade e erros de domínio
├── application/
│   ├── ports/        # Interfaces dos repositórios
│   └── services/     # Casos de uso
├── infrastructure/
│   └── persistence/  # Implementação Prisma
└── presentation/
    └── http/         # Controller + DTOs
```

## Modos de correção

| Modo | Comportamento |
|------|---------------|
| `strict` | Resposta deve ser idêntica ao gabarito |
| `lenient` | Resposta deve ser subconjunto válido do gabarito |

## Formatos de resposta

| Formato | Labels | Exemplo |
|---------|--------|---------|
| `letters` | A, B, C, D… | `"AB"` |
| `powers_of_two` | 1, 2, 4, 8… | `"3"` (= 1+2) |
