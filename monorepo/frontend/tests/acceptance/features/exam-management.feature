Feature: Exam Management
  As a logged-in teacher
  I want to create and view exams
  So that I can compose and track assessments for my students

  Background:
    Given I am logged in as a teacher

  Scenario: View the exams list on dashboard
    When I navigate to the dashboard
    Then I should see the dashboard page
    And I should see the exams section

  Scenario: Navigate to create a new exam
    When I navigate to create a new exam
    Then I should see the new exam form
    And the form should contain fields for title, subject and answer format

  Scenario: Create a new exam with the available questions
    When I navigate to create a new exam
    And I fill in the exam title with "Prova de Teste Gherkin"
    And I fill in the exam subject with "Testes Automatizados"
    And I select at least one question
    And I submit the exam form
    Then I should be redirected to the exam detail page
    And I should see "Prova de Teste Gherkin" on the page

  Scenario: Cancel exam creation returns to previous page
    When I navigate to create a new exam
    And I click the cancel button
    Then I should not be on the new exam page
