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

```
src/
├── app/
│   ├── (public)/               # unauthenticated pages (login, register)
│   └── (dashboard)/            # authenticated pages, one folder per route
│       └── <feature>/
│           └── page.tsx
├── components/
│   ├── primitives/             # shadcn/ui base components (button, input, badge…)
│   ├── shared/                 # reusable cross-feature (PageHeader, DataTable, EmptyState…)
│   ├── layout/
│   │   └── <feature>/          # page-specific components for this feature
│   │       ├── <Feature>Table.tsx
│   │       └── <Feature>Form.tsx
│   └── providers/              # React context providers
└── lib/
    ├── api/
    │   └── <feature>.ts        # fetch calls, typed, uses apiRequest()
    └── types.ts                # shared TypeScript types mirroring backend DTOs
```

### Frontend Rules

- Component types: `primitives/` = shadcn base, `shared/` = cross-feature reusables, `layout/<feature>/` = page-specific
- All HTTP calls go through `lib/api/` — no direct fetch in components
- TanStack Query for all data fetching and mutations
- No `any`

## After Generating

List every file created. Flag any decision that needs attention (missing Prisma model, undecided business rule, auth scope).
