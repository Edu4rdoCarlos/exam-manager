# Write Gherkin Scenarios

Write acceptance test scenarios in Gherkin (Cucumber).

Given the feature name and requirements, produce a `.feature` file at `server/test/features/<feature-name>.feature`.

## Coverage Requirements

Every feature file must contain:

- At least one `@happy-path` scenario per operation (create, read, update, delete when applicable)
- At least one `@error-case` scenario per business rule that can be violated
- At least one `@edge-case` scenario for boundary values or empty collections

## Scenario Design Rules

- One scenario = one observable behavior
- Scenario titles must be descriptive enough to serve as documentation
- Use `Scenario Outline` + `Examples` for data-driven cases
- Steps must be reusable across scenarios — no one-off phrasing
- Do not invent business rules not stated in requirements
- Use `Background` for state that applies to all scenarios in the file
- Never chain unrelated steps with `And`

## Step Phrasing Rules

- `Given` — system state before the action (setup, existing data)
- `When` — the single action being tested
- `Then` — observable outcome (response, side effect, persisted state)
- Step text must match exactly what the step definition will implement
- Use Cucumber expressions: `{string}`, `{int}`, `{float}` for parameters

## File Structure

```gherkin
Feature: <Feature Name>
  As a <role>
  I want to <action>
  So that <benefit>

  Background:
    Given <shared precondition>

  @happy-path
  Scenario: <descriptive title>
    Given ...
    When ...
    Then ...

  @error-case
  Scenario: <descriptive title>
    ...

  @edge-case
  Scenario Outline: <descriptive title>
    ...
    Examples:
      | param | expected |
```

## After Writing Scenarios

List every step definition signature that must be implemented:

```ts
Given('...', async function () { ... })
When('... {string} ...', async function (param: string) { ... })
Then('...', async function () { ... })
```

Group by file: `server/test/steps/<feature-name>.steps.ts`
