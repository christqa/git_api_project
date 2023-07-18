Feature: User validate current password

    Feature Description
    @SW-1672
    Scenario:  Password empty
        Given resource "/users/validate-current-password"
        And token "valid"
        And request "user-password-validate/password-empty.json"
        When method "post"
        Then status 400
        And message "\"password\" is not allowed to be empty"

    @SW-1672
    Scenario:  Password incorrect
        Given resource "/users/validate-current-password"
        And token "valid"
        And request "user-password-validate/password-incorrect.json"
        When method "post"
        Then status 400
        And message "The password you entered is incorrect."