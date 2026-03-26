# Exam Manager

Sistema de criação e correção de provas acadêmicas com suporte a múltiplas versões, gabaritos e geração de notas.

Desenvolvido para a disciplina **Tópicos Avançados em Linguagens de Programação I** na UFPE, com implementação conduzida por agentes de IA (Claude Code).

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | NestJS + TypeScript |
| Banco de dados | PostgreSQL + Prisma ORM |
| Frontend | Next.js + TypeScript |
| Deploy | Railway |

## Como rodar localmente

**Pré-requisitos:** Node.js 20+, Docker

```bash
# Subir o banco
docker compose up -d

# Instalar dependências
npm install

# Gerar o Prisma Client e aplicar migrations
cd monorepo/database && npx prisma generate && npx prisma migrate deploy && cd ../..

# Backend (http://localhost:3001, Swagger em /docs)
cd monorepo/backend && npm run start:dev

# Frontend (http://localhost:3000)
cd monorepo/frontend && npm run dev
```

## Variáveis de ambiente

Copie `monorepo/backend/.env.example` para `monorepo/backend/.env`. Os valores padrão já funcionam com o Docker Compose.

## Funcionalidades

- Autenticação JWT para professores
- Criação de questões com alternativas de múltipla escolha
- Criação de provas associando questões
- Geração de versões com embaralhamento automático + exportação PDF
- Gabaritos por versão + exportação CSV
- Importação de respostas dos alunos via CSV
- Correção em modo `strict` ou `lenient`
- Consulta de notas por versão ou correção

## Deploy

Configurado para **Railway** via `Dockerfile` e `railway.toml`. Conecte o repositório, adicione o plugin PostgreSQL e configure `DATABASE_URL` e `JWT_SECRET`. As migrations são aplicadas automaticamente na inicialização.
