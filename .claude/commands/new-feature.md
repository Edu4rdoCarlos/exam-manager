# New Feature — Scaffold

Scaffold a complete feature following Clean Architecture.

Given the feature name and description, generate all files for both NestJS (backend) and Next.js (frontend).

## Project Structure

```
src/
├── shared/
│   ├── guards/
│   ├── decorators/
│   └── types/
└── modules/
    ├── auth/
    ├── users/
    ├── students/
    └── exams/
        ├── exam/
        ├── versions/
        ├── keys/
        └── corrections/
```

## Backend (NestJS)

Generate in `server/src/modules/<module>/<feature>/`:

```
<feature>/
├── domain/
│   └── <Feature>.ts                    # entity, readonly fields, no framework imports
├── application/
│   ├── <Feature>Repository.ts          # port (interface)
│   └── <Feature>Service.ts             # use cases as methods, depends on port
├── presentation/
│   ├── <Feature>Controller.ts          # NestJS controller with @UseGuards(JwtAuthGuard)
│   └── <feature>.dto.ts                # all DTOs (create, update, response)
├── infrastructure/
│   └── Prisma<Feature>Repository.ts    # implements port using PrismaService
└── <feature>.module.ts                 # wires port to adapter via NestJS DI
```

### Layer Rules

- **domain** — pure TypeScript entity, `readonly` fields, no framework, no Prisma, no ports
- **application** — defines repository port as `interface`, service depends on port via constructor injection
- **presentation** — NestJS controller + DTOs with `class-validator`, returns typed response objects, never raw entities
- **infrastructure** — Prisma adapter implementing the repository port, maps Prisma records to domain entities via private `toDomain()` method

### Code Rules

- No `any`
- Explicit return types on all public methods
- Errors are typed domain classes or `Result<T, E>`, never raw `throw new Error("string")`
- Repository adapter uses `PrismaService`, not raw SQL
- Use cases receive ports via constructor injection — never `new ConcreteClass()`

## Frontend (Next.js)

Generate in `client/src/features/<feature>/`:

```
<feature>/
├── api/
│   └── <feature>Api.ts         # axios calls, typed
├── components/
│   ├── <Feature>List.tsx        # shadcn/ui + TailwindCSS
│   └── <Feature>Form.tsx        # react-hook-form + zod resolver
├── hooks/
│   └── use<Feature>.ts          # react-query, data fetching + mutations
└── types/
    └── <feature>.types.ts       # TypeScript types + zod schema
```

### Frontend Rules

- Zod schema must mirror the backend DTO exactly
- All HTTP calls go through `api/` — no direct fetch in components or hooks
- react-query keys are stable string arrays
- No `any`

## After Generating

List every file created. Flag any decision that needs attention (missing Prisma model, undecided business rule, auth scope).
