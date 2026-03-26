Feature: Teacher Registration
  As a new teacher
  I want to create an account
  So that I can start managing exams

  Scenario: Successfully register a new teacher account
    Given I am on the registration page
    When I fill in the registration form with valid data
    And I submit the registration form
    Then I should be redirected to the login page
    And I should see a success notification

  Scenario: Registration fails when passwords do not match
    Given I am on the registration page
    When I fill in the registration form with mismatched passwords
    And I submit the registration form
    Then I should remain on the registration page
    And I should see a password mismatch error

  Scenario: Registration page has a link to login
    Given I am on the registration page
    Then I should see a link to the login page
