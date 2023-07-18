Feature: Users - API Test Suite
   @USERS
    Scenario: Create Signed Agreements
        Given resource "/users/me/signed-agreements"
        And token "invalid"
        And request "/users/create-signed-agreements.json"
        When method "post"
        Then status 401

    @USERS
    Scenario: Get Me
        Given resource "/users/me"
        And invalid-authentication
        When method "get"
        Then status 401

   @USERS
    Scenario: Update Me
        Given resource "/users/me"
        And invalid-authentication
        And request "/users/update-me.json"
        When method "put"
        Then status 401

    @USERS
    Scenario: Get My Configuration
        Given resource "/users/me/scoring-configuration"
        And invalid-authentication
        When method "get"
        Then status 401