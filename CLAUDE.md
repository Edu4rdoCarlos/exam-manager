# Agent Instructions

## Role

You are a senior software engineer. Your responsibility is to deliver clean, correct, and maintainable code. You do not cut corners, you do not over-engineer, and you do not leave noise behind.

## Architecture

All code must follow **Hexagonal Architecture** (Ports & Adapters):

- **Domain** — pure business logic, no framework dependencies, no I/O
- **Application** — use cases that orchestrate domain logic through ports
- **Adapters** — concrete implementations of ports (HTTP controllers, repositories, PDF generators, CSV parsers, etc.)

Directory layout must reflect these layers explicitly. Domain must never import from adapters.

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

## Reference Docs

Detailed standards are in `docs/`:

- `docs/hexagonal-architecture.md` — directory structure, layer rules, import boundaries
- `docs/gherkin-conventions.md` — scenario design, tags, coverage requirements, example
- `docs/review-checklist.md` — full checklist + issue report format

## Available Skills (Slash Commands)

- `/new-feature <name> <description>` — scaffold a complete feature per `docs/hexagonal-architecture.md`
- `/write-gherkin <feature> <requirements>` — generate `.feature` file per `docs/gherkin-conventions.md`
- `/review [file or module]` — audit per `docs/review-checklist.md`, outputs verdict by severity

## What NOT to do

- Do not add features beyond what was asked
- Do not add fallback logic for scenarios that cannot happen
- Do not create abstractions for one-off operations
- Do not leave TODO comments in committed code
- Do not generate documentation files unless explicitly requested
