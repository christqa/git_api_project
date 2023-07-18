Feature: Test cases for user/me endpoint

    @SW-1700
    Scenario:Empty first name for the endpoint PUT /users/me
        Given resource "/users/me"
        And token "valid"
        And request "/users-me/empty-firstName.json"
        When method "put"
        Then status 400
        And message "\"firstName\" is not allowed to be empty"

    @SW-1700
    Scenario:Empty last name for the endpoint PUT /users/me
        Given resource "/users/me"
        And token "valid"
        And request "/users-me/empty-lastName.json"
        When method "put"
        Then status 400
        And message "\"lastName\" is not allowed to be empty"

    @SW-1700
    Scenario:dob less than 18 years old for the endpoint PUT /users/me
        Given resource "/users/me"
        And token "valid"
        And request "/users-me/dob.json"
        When method "put"
        Then status 400


    @SW-1700
    Scenario: Weight less than 5 for the endpoint PUT /users/me
        Given resource "/users/me"
        And token "valid"
        And request "/users-me/lessThan5-weight.json"
        When method "put"
        Then status 400
        And message "\"weightLbs\" must be greater than or equal to 5"

    @SW-1700
    Scenario:Empty weight for the endpoint PUT /users/me
        Given resource "/users/me"
        And token "valid"
        And request "/users-me/empty-weight.json"
        When method "put"
        Then status 400
        And message "\"weightLbs\" is required"

    @SW-1700
    Scenario:Weight more than 1500 for the endpoint PUT users/me
        Given resource "/users/me"
        And token "valid"
        And request "/users-me/moreThan1500-weight.json"
        When method "put"
        Then status 400
        And message "\"weightLbs\" must be less than or equal to 1500"