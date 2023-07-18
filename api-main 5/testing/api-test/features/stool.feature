Feature: Stool - API Test Suite
   @STOOL
    Scenario: Get Stool
        Given resource "/stools"
        And invalid-authentication
        And request "/stool/get-stool.json"
        When method "get"
        Then status 401

    @STOOL
    Scenario: Delete Stool
        Given resource "/stools"
        And invalid-authentication
        And request "/stool/delete-stool.json"
        When method "delete"
        Then status 401