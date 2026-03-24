# Gherkin Conventions — Project Reference

## File Location

`server/test/features/<feature-name>.feature`

## Step Keywords

| Keyword | Use for |
|---|---|
| `Given` | System state before the action |
| `When` | The action performed |
| `Then` | The observable outcome |
| `And` / `But` | Continuation — never chain unrelated steps |

## Tags

| Tag | When to use |
|---|---|
| `@happy-path` | Expected success flows |
| `@error-case` | Invalid input, not found, duplicates |
| `@edge-case` | Boundary values, empty collections |

## Coverage Requirements (per CRUD feature)

- `@happy-path` — create, read, update, delete succeed
- `@error-case` — not found, invalid input, business rule violation
- `@edge-case` — boundary values, empty states

## Scenario Design Rules

- One scenario = one observable behavior
- Titles must be descriptive enough to serve as documentation
- Use `Scenario Outline` + `Examples` for data-driven cases
- Steps must be reusable across scenarios
- Do not invent business rules not stated in requirements
- Steps must match exactly what step definitions implement

## Example

```gherkin
Feature: Question Management
  As a professor
  I want to manage exam questions
  So that I can build exams from a reusable question bank

  Background:
    Given the system has no questions registered

  @happy-path
  Scenario: Create a question with valid data
    When I create a question with statement "What is SOLID?" and 3 alternatives
    Then the question is saved successfully
    And the question has 3 alternatives

  @error-case
  Scenario: Reject a question without alternatives
    When I create a question with statement "Empty?" and 0 alternatives
    Then the system returns error "A question must have at least 2 alternatives"

  @edge-case
  Scenario Outline: Validate alternative count boundaries
    When I create a question with <count> alternatives
    Then the result is <outcome>

    Examples:
      | count | outcome |
      | 1     | error   |
      | 2     | success |
      | 10    | success |
```

## After Writing Scenarios

List the step definition signatures that must be implemented:

```ts
Given('the system has no questions registered', ...)
When('I create a question with statement {string} and {int} alternatives', ...)
Then('the question is saved successfully', ...)
Then('the question has {int} alternatives', ...)
Then('the system returns error {string}', ...)
```
