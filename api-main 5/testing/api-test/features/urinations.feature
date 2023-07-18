Feature: Urinations - API Test Suite
   @URINATIONS
    Scenario: Get Urinations
        Given resource "/urinations"
        And invalid-authentication
        And request "/urinations/get-urinations.json"
        When method "get"
        Then status 401

   @URINATIONS
    Scenario: Delete Urinations
        Given resource "/urinations"
        And invalid-authentication
        And request "/urinations/delete-urinations.json"
        When method "delete"
        Then status 401