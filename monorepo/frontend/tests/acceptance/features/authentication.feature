Feature: Authentication
  As a teacher
  I want to log in to the system
  So that I can access the exam management dashboard

  Scenario: Successful login redirects to dashboard
    Given I am on the login page
    When I fill in the email field with "rofepssor@exam.com"
    And I fill in the password field with "senha123"
    And I click the submit button
    Then I should be redirected to the dashboard
    And I should see the dashboard page

  Scenario: Login fails with wrong credentials
    Given I am on the login page
    When I fill in the email field with "rofepssor@exam.com"
    And I fill in the password field with "wrongpassword"
    And I click the submit button
    Then I should remain on the login page
    And I should see an error notification

  Scenario: Unauthenticated user is redirected to login
    Given I am not logged in
    When I navigate to the dashboard
    Then I should be redirected to the login page

  Scenario: Login page has a link to registration
    Given I am on the login page
    Then I should see a link to the registration page
