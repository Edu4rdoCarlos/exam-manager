# Code Quality Review Checklist

## Architecture — Hexagonal

- [ ] Domain has zero imports from adapters or frameworks
- [ ] All external dependencies are behind port interfaces
- [ ] Use cases depend only on ports, never on concrete adapters
- [ ] No cross-feature direct imports — modules communicate through ports

## SOLID

- [ ] **S** — each class/function has one clearly stated responsibility
- [ ] **O** — new behavior added via extension, not modification of existing code
- [ ] **L** — no `instanceof` chains or type assertions to handle subtypes differently
- [ ] **I** — interfaces are narrow; no method that some implementor leaves empty
- [ ] **D** — constructors receive interfaces, not `new ConcreteClass()`

## TypeScript

- [ ] No `any`
- [ ] `readonly` on domain entity fields
- [ ] Explicit return types on public methods
- [ ] Errors are typed domain classes or `Result<T, E>` — not raw `throw new Error("string")`

## Cleanliness

- [ ] No `console.log`, `console.info`, `console.debug`
- [ ] No inline comments explaining what the code does
- [ ] No dead code (unused vars, unreachable branches, commented-out blocks)
- [ ] No TODO / FIXME in committed code

## Tests

- [ ] Each Gherkin scenario covers exactly one behavior
- [ ] Domain unit tests have no I/O dependencies
- [ ] No shared mutable state between test cases
- [ ] Test names describe behavior, not implementation

## Issue Report Format

```
[LAYER] FILE:LINE — RULE VIOLATED
  Problem: <what is wrong>
  Fix: <concrete suggestion>
```

Severity: `BLOCKER` (breaks architecture) | `MAJOR` (SOLID/typing) | `MINOR` (cleanliness)

Finish with: total issues per severity + verdict (`APPROVED` | `NEEDS WORK` | `REJECTED`)
