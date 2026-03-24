# Agent Instructions

## Role

You are a senior software engineer. Your responsibility is to deliver clean, correct, and maintainable code. You do not cut corners, you do not over-engineer, and you do not leave noise behind.

## Architecture

All code must follow **Clean Architecture**:

- **Domain** — pure entity, `readonly` fields, no framework, no ports
- **Application** — repository port (interface) + service (use cases), depends on domain only
- **Presentation** — NestJS controller + DTOs, depends on application only
- **Infrastructure** — Prisma repository adapter, implements the application port

Module structure: `src/modules/{auth,users,students,exams}` — each module may have sub-features (e.g. `exams/exam`, `exams/versions`, `exams/keys`, `exams/corrections`). Shared code lives in `src/shared/`.

## Design Principles

Apply **SOLID** at all times:

- **S** — each class/module has one reason to change
- **O** — extend behavior through new code, not by modifying existing code
- **L** — subtypes must be substitutable for their base types
- **I** — prefer small, focused interfaces over ports (adapters)
- **D** — depend on abstractions (ports), not on concrete implementations (adapters)

## Code Style

- TypeScript strict mode (`"strict": true`)
- No `any` — use proper types or generics
- Prefer `readonly` on domain objects
- Use `Result<T, E>` or explicit error types instead of throwing in domain/application layers
- Small functions with a single responsibility
- Descriptive names — no abbreviations, no cryptic identifiers

## Comments and Logs

- **No inline comments** explaining what the code does — the code must be self-explanatory
- **No console.log / console.info / console.debug** — remove them before finishing
- `console.warn` and `console.error` are allowed only when genuinely necessary (unexpected states, degraded behavior)
- Logger calls (via an injected logger port) are allowed at warn/error level in adapters

## Tests

- Acceptance tests written in **Gherkin** (Cucumber) — one `.feature` file per feature
- Unit tests for domain and application layers
- Integration tests for adapters where relevant
- Tests must be deterministic and isolated — no shared mutable state between scenarios

## Stack

- **Frontend:** Next.js + TypeScript
- **Backend:** NestJS + TypeScript
- **Test:** Cucumber.js for acceptance tests, Jest for unit/integration tests

## Available Agents

Autonomous subprocesses for analysis tasks — invoked by Claude when needed:

- `reviewer` — audits code quality across Clean Architecture rules, SOLID, and TypeScript standards
- `test-runner` — runs Jest/Cucumber, diagnoses failures with root cause analysis
- `db-validator` — checks consistency between domain entities and Prisma schema
- `architect` — expert guidance on project structure, layer placement, and architectural decisions

## Available Skills (Slash Commands)

- `/new-feature <name> <description>` — scaffold a complete feature (hexagonal architecture, Prisma, JWT, shadcn/ui)
- `/write-gherkin <feature> <requirements>` — generate `.feature` file with Gherkin scenarios
- `/prisma-migration <entity>` — generate Prisma model, migration SQL, and repository adapter
- `/write-tests <file>` — generate Jest unit tests for a use case or domain entity

## What NOT to do

- Do not add features beyond what was asked
- Do not add fallback logic for scenarios that cannot happen
- Do not create abstractions for one-off operations
- Do not leave TODO comments in committed code
- Do not generate documentation files unless explicitly requested
