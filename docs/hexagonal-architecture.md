# Hexagonal Architecture — Project Reference

## Layer Responsibilities

| Layer | Responsibility | Allowed imports |
|---|---|---|
| **Domain** | Business entities, rules, domain errors | Nothing external |
| **Application** | Use cases, orchestration via ports | Domain only |
| **Adapters** | HTTP, persistence, PDF, CSV | Application ports |

Domain must never import from Application or Adapters. Application must never import from Adapters.

## Backend Structure (NestJS) — `server/src/<feature>/`

```
<feature>/
├── domain/
│   ├── <Feature>.ts                      # Entity with readonly fields
│   ├── <Feature>Repository.ts            # Repository port (interface)
│   └── errors/
│       └── <Feature>NotFound.ts          # Typed domain errors
├── application/
│   ├── ports/
│   │   └── <Feature>Service.ts           # Service port (interface)
│   └── use-cases/
│       ├── Create<Feature>.ts
│       ├── Update<Feature>.ts
│       ├── Delete<Feature>.ts
│       └── Get<Feature>.ts
├── adapters/
│   ├── http/
│   │   ├── <Feature>Controller.ts
│   │   └── dto/
│   │       ├── Create<Feature>Dto.ts
│   │       └── Update<Feature>Dto.ts
│   └── persistence/
│       └── InMemory<Feature>Repository.ts
└── <Feature>Module.ts
```

## Frontend Structure (Next.js) — `client/src/features/<feature>/`

```
<feature>/
├── api/
│   └── <feature>Api.ts           # HTTP calls to backend
├── components/
│   ├── <Feature>List.tsx
│   ├── <Feature>Form.tsx
│   └── <Feature>Card.tsx
├── hooks/
│   └── use<Feature>.ts           # Data fetching + local state
└── types/
    └── <feature>.types.ts
```

## Key Rules

- Domain entities: `readonly` fields, no framework imports
- Ports: TypeScript `interface` only — never concrete classes
- Use cases: receive ports via constructor injection
- DTOs: `class-validator` decorators (NestJS)
- `index.ts` barrels only when they reduce import noise
