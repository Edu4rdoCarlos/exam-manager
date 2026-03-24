# Prisma Migration — Schema + Repository Adapter

Given a domain entity name and its fields, generate the Prisma model and the repository adapter that implements the domain port.

## What to Generate

### 1. Prisma model — append to `server/prisma/schema.prisma`

- Map field names to snake_case columns via `@map`
- Use `@id @default(uuid())` for UUID primary keys
- Use `@unique` where the domain requires uniqueness
- Add `@@map("table_name")` to match the existing database table name
- Define relations with explicit `fields` and `references`
- Never add fields not present in the domain entity

### 2. Repository adapter — `server/src/modules/<module>/<feature>/infrastructure/Prisma<Feature>Repository.ts`

- Implement the domain repository port interface exactly
- Inject `PrismaService` via constructor
- Map Prisma result objects to domain entities — never return raw Prisma types outside the adapter
- Use a private `toDomain(record: PrismaModel): DomainEntity` method for the mapping
- Return `null` (not throw) when a record is not found in `findById` / `findByX` methods
- Wrap Prisma calls in try/catch only for known constraint violations (e.g. unique conflict) — let unexpected errors propagate

### 3. Migration file — `server/prisma/migrations/<timestamp>_<name>/migration.sql`

- Write idempotent SQL (`CREATE TABLE IF NOT EXISTS`, `CREATE UNIQUE INDEX IF NOT EXISTS`)
- Match the Prisma model exactly — no extra columns
- Include foreign key constraints where applicable

## Rules

- The adapter must not contain business logic — only persistence mapping
- No `any` — type the Prisma result explicitly
- The domain entity constructor or factory must be called in `toDomain`, not inline
- If the Prisma model already exists, only generate the adapter

## After Generating

List what was created or modified. Flag if the Prisma model conflicts with an existing migration.
