Feature: Question Bank Management
  As a logged-in teacher
  I want to manage my question bank
  So that I can compose exams from reusable questions

  Background:
    Given I am logged in as a teacher

  Scenario: View the question bank page
    When I navigate to the questions page
    Then I should see the question bank page
    And I should see existing questions listed

  Scenario: Create a new question with alternatives
    When I navigate to the questions page
    And I click the "Nova Questão" button
    And I fill in the question statement with "Qual é a capital do Brasil?"
    And I fill in the first alternative with "Brasília"
    And I fill in the second alternative with "São Paulo"
    And I save the question
    Then I should see the question "Qual é a capital do Brasil?" in the list

  Scenario: Question dialog opens and closes
    When I navigate to the questions page
    And I click the "Nova Questão" button
    Then I should see the question creation dialog
    When I click cancel
    Then the dialog should be closed
