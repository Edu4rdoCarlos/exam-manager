Feature: Exam Correction
  As a logged-in teacher
  I want to correct exam answers submitted by students
  So that I can generate grades based on the answer key

  Background:
    Given I am logged in as a teacher
    And a question exists with statement "Qual é a capital do Brasil?" and correct alternative "Brasília"
    And a question exists with statement "Qual é a maior cidade do Brasil?" and correct alternative "São Paulo"
    And an exam exists with that question and answer format "letters"
    And a student is registered with CPF "111.222.333-44" and name "Aluno Teste"

  # ─── Version & Answer Key ───────────────────────────────────────────────────

  @happy-path
  Scenario: Generating exam versions automatically creates the answer key
    Given the exam has no versions yet
    When I generate 1 version for the exam
    Then 1 exam version should exist
    And an answer key should be automatically generated for that version

  # ─── Full Correction Flow ────────────────────────────────────────────────────

  @happy-path
  Scenario: Student answers all questions correctly and receives full score
    Given the exam has 1 generated version with an answer key
    And a correction exists for the exam in "strict" mode
    When I upload a CSV with the student CPF "111.222.333-44" answering all questions correctly
    Then the correction should be applied successfully
    And the student "111.222.333-44" should have a score of 1.0

  @happy-path
  Scenario: Student answers some questions correctly and receives a partial score
    Given the exam has 1 generated version with an answer key
    And a correction exists for the exam in "strict" mode
    When I upload a CSV with the student CPF "111.222.333-44" answering half of the questions correctly
    Then the correction should be applied successfully
    And the student "111.222.333-44" should have a score greater than 0.0 and less than 1.0

  @happy-path
  Scenario: Student answers all questions incorrectly and receives zero
    Given the exam has 1 generated version with an answer key
    And a correction exists for the exam in "strict" mode
    When I upload a CSV with the student CPF "111.222.333-44" answering all questions incorrectly
    Then the correction should be applied successfully
    And the student "111.222.333-44" should have a score of 0.0

  @happy-path
  Scenario: Multiple students are graded in the same correction
    Given the exam has 1 generated version with an answer key
    And a student is registered with CPF "555.666.777-88" and name "Outro Aluno"
    And a correction exists for the exam in "strict" mode
    When I upload a CSV with answers for both "111.222.333-44" and "555.666.777-88"
    Then the correction should be applied successfully
    And grades should be emitted for 2 students

  # ─── Lenient Mode ────────────────────────────────────────────────────────────

  @happy-path
  Scenario: Lenient correction accepts partial subset answers as correct
    Given the exam has 1 generated version with an answer key for a "powers_of_two" format exam
    And a correction exists for the exam in "lenient" mode
    When I upload a CSV with the student CPF "111.222.333-44" answering with a valid subset
    Then the correction should be applied successfully
    And the student "111.222.333-44" should have a score of 1.0

  # ─── Error Cases ─────────────────────────────────────────────────────────────

  @error-case
  Scenario: CSV references a student not registered in the system
    Given the exam has 1 generated version with an answer key
    And a correction exists for the exam in "strict" mode
    When I upload a CSV with an unregistered CPF "000.000.000-00"
    Then the correction should fail with a student not found error

  @error-case
  Scenario: CSV references an exam version that does not exist
    Given a correction exists for the exam in "strict" mode
    When I upload a CSV referencing a non-existent exam version id
    Then the correction should fail with a version not found error

  # ─── Edge Cases ──────────────────────────────────────────────────────────────

  @edge-case
  Scenario Outline: Score boundary values depending on correct answers count
    Given the exam has <total> questions with generated versions and answer keys
    And a correction exists for the exam in "strict" mode
    When the student answers <correct> out of <total> questions correctly
    Then the student should have a score of <score>

    Examples:
      | total | correct | score |
      | 4     | 4       | 1.0   |
      | 4     | 2       | 0.5   |
      | 4     | 1       | 0.25  |
      | 4     | 0       | 0.0   |

  @edge-case
  Scenario: Applying correction when no versions exist produces no grades
    Given the exam has no versions
    And a correction exists for the exam in "strict" mode
    When I apply the correction
    Then 0 grades should be emitted
