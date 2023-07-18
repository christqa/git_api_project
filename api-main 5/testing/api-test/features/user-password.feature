
Feature: User password update

    Feature Description
    @SW-1629
    Scenario: New password empty
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/newPassword-empty.json"
        When method "put"
        Then status 400
        And message "\"newPassword\" is not allowed to be empty"

    @SW-1629
    Scenario: New password that is less then 8 characters
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/newPassword-lessThan8.json"
        When method "put"
        Then status 400
        And message "\"newPassword\" length must be at least 8 characters long, Password requirements: upper and lower case letters, at least one number, at least one special character"

    @SW-1629
    Scenario: New password is without uppercase
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/newPassword-withoutUpper.json"
        When method "put"
        Then status 400
        And message "Password requirements: upper and lower case letters, at least one number, at least one special character"

    @SW-1629
    Scenario: New password is without lowercase
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/newPassword-withoutLower.json"
        When method "put"
        Then status 400
        And message "Password requirements: upper and lower case letters, at least one number, at least one special character"

    @SW-1629
    Scenario: New password without number
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/newPassword-withoutNumber.json"
        When method "put"
        Then status 400
        And message "Password requirements: upper and lower case letters, at least one number, at least one special character"

    @SW-1629
    Scenario: New password without Special Character
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/newPassword-withoutSpecialChar.json"
        When method "put"
        Then status 400
        And message "Password requirements: upper and lower case letters, at least one number, at least one special character"

    @SW-1629
    Scenario: Current password empty
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/currentPassword-empty.json"
        When method "put"
        Then status 400
        And message "\"currentPassword\" is not allowed to be empty"

    @SW-1629
    Scenario: inccorect password
        Given resource "/users/password-update"
        And token "valid"
        And request "user-password-update/inccorect-password.json"
        When method "put"
        Then status 400
        And message "The password you entered is incorrect."

