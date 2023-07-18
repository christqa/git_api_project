Feature: Data Store - API Test Suite
   @DATA_STORE
    Scenario: Update Data Store
        Given resource "/data-store"
        And invalid-authentication
        And request "/data-store/update-data-store.json"
        When method "put"
        Then status 401

    @DATA_STORE
    Scenario: Patch Data Store
        Given resource "/data-store"
        And invalid-authentication
        And request "/data-store/patch-data-store.json"
        When method "patch"
        Then status 401


    @DATA_STORE
    Scenario: Get Data Store
        Given resource "/data-store"
        And invalid-authentication
        When method "get"
        Then status 401
