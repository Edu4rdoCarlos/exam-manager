Feature: Student Management
  As a logged-in teacher
  I want to register students
  So that I can track their exam results

  Background:
    Given I am logged in as a teacher

  Scenario: Navigate to student registration form
    When I navigate to the new student page
    Then I should see the student registration form
    And the form should have name and CPF fields

  Scenario: Register a new student
    When I navigate to the new student page
    And I fill in the student name with "Aluno Gherkin"
    And I fill in the student CPF with "999.888.777-66"
    And I submit the student form
    Then I should be redirected to the dashboard

  Scenario: Cancel student registration returns to previous page
    When I navigate to the new student page
    And I click the cancel button
    Then I should not be on the new student page
