# Write Tests — Jest Unit Tests

Given a use case file or domain entity file, generate Jest unit tests.

## Test File Location

- For use cases: `server/src/<feature>/application/use-cases/__tests__/<UseCase>.spec.ts`
- For domain entities: `server/src/<feature>/domain/__tests__/<Entity>.spec.ts`

## Use Case Tests

For each use case, generate:

- One `describe` block named after the use case class
- A `beforeEach` that creates fresh mocks and a new use case instance
- One `it` block per behavior (success path + each error path)

Port mocking rules:
- Mock every port the use case depends on using `jest.fn()`
- Type mocks as `jest.Mocked<PortInterface>`
- Reset mocks in `beforeEach` — no shared state between tests
- Only mock what the test needs — leave other methods unset

Assertion rules:
- Assert the return value (or error) of the use case
- Assert that ports were called with the correct arguments
- Use `expect.objectContaining()` for partial matching when appropriate
- Never assert on implementation details (private methods, internal state)

## Domain Entity Tests

For each entity, generate:

- One `describe` block per factory method or business rule method
- Test valid construction succeeds
- Test each validation rule produces the correct typed error
- No mocks — domain tests are pure

## General Rules

- No `any`
- No I/O in unit tests (no file reads, no HTTP, no database)
- Test names describe behavior: `'should return NotFound when question does not exist'`
- Do not test that a method was called if the return value already proves correctness

## After Generating

List every test case created. Flag any behavior that could not be tested without additional setup.
