# Exam Manager

## Motivation

Academic assessment workflows often rely on fragmented, manual processes: teachers create exams in text editors, shuffle question versions by hand, grade answer sheets one by one, and calculate scores in separate spreadsheets. This approach is error-prone, time-consuming, and makes it hard to trace relationships between exam versions, answer keys, and final grades.

**Exam Manager** centralizes and automates this entire cycle — from exam creation to grade report generation — in a structured, auditable, and extensible API.

## Objective

This project is an assignment for the course **Advanced Topics in Programming Languages I** at UFPE. Its central goal is to explore **AI agent-driven development**: the entire implementation was carried out in direct collaboration with autonomous AI agents (Claude Code), which acted as software engineers — reading requirements, making architectural decisions, writing code, running code reviews, and fixing issues iteratively.

The aim is not only to build the system, but to investigate how language model agents can actively participate in a real software development cycle, from initial scaffolding all the way to production deployment.

## What the system does

- **Authentication** — JWT-based login for teachers
- **Questions** — create, read, update, and delete questions with multiple-choice alternatives
- **Exams** — create and manage exams by associating questions with ordinal positions
- **Exam versions** — generate versions with shuffled questions and alternatives; export as PDF
- **Answer keys** — register answer keys per version; export as CSV
- **Student answers** — manual submission or bulk import via CSV
- **Correction** — apply correction in `strict` or `lenient` mode; import answers and run correction from a single CSV file
- **Grades** — query grades by version or correction; enriched report with student and exam details

## Stack

| Layer | Technology |
|---|---|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| API docs | Swagger (available at `/docs`) |
| Deploy | Railway |

## Architecture

The backend follows **Clean Architecture** with strict layer separation:

```
src/modules/{feature}/
  domain/          — entities and domain errors (no external dependencies)
  application/     — use cases and ports (interfaces)
  infrastructure/  — Prisma, CSV, and PDF adapters
  presentation/    — NestJS controllers and DTOs
```

## Running locally

**Prerequisites:** Node.js 20+, Docker

```bash
# Start the database
docker compose up -d

# Install dependencies
npm install

# Generate the Prisma client and apply migrations
npm run generate --workspace=@exam-manager/database
npm run migrate:dev --workspace=@exam-manager/database

# Start the backend in development mode
npm run start:dev --workspace=@exam-manager/backend
```

The API will be available at `http://localhost:3001` and Swagger at `http://localhost:3001/docs`.

## Environment variables

Create a `.env` file at the project root:

```env
DATABASE_URL=postgresql://exam_manager:exam_manager@localhost:5432/exam_manager
JWT_SECRET=your-secret-key
```

## Deployment

The project is configured for deployment on **Railway** via `Dockerfile` and `railway.toml`. Connect the repository, add the PostgreSQL plugin, and set the `DATABASE_URL` and `JWT_SECRET` environment variables. Migrations are applied automatically on container startup.
