Feature:Automation for GET /users/me

    @SW-1711
    Scenario:Updating the Update height, weight, dob and gender then geting the info and verifying if it is the same for GET /users/me
        Given resource "/users/me"
        And token "valid"
        And request with date "/users-me/updateme.json"
        And exp response with date "/users-me/updated.json"
        When method "put"
        When method "get"
        Then specific respose verification "firstName;lastName;profile"

    @SW-1712
    Scenario:Updating medications and medical history then geting the info and verifying if it is the same for GET /users/me
        Given resource "/users/me"
        And token "valid"
        And request with date "/users-me/updatemmhist.json"
        And exp response with date "/users-me/updatedmmhist.json"
        When method "put"
        And method "get"
        Then specific respose verification "firstName;lastName;profile"

    @SW-1713
    Scenario:Updating bathroom usage values then geting the info and verifying if it is the same for GET /users/me
        Given resource "/users/me"
        And token "valid"
        And request with date "/users-me/updateBathroom.json"
        And exp response with date "/users-me/updatedBathroom.json"
        When method "put"
        And method "get"
        Then specific respose verification "firstName;lastName;profile"

    @SW-1714
    Scenario:Updating lifeStyle usage values then geting the info and verifying if it is the same for GET /users/me
        Given resource "/users/me"
        And token "valid"
        And request with date "/users-me/updateLifeStyle.json"
        And exp response with date "/users-me/updatedLifeStyle.json"
        When method "put"
        And method "get"
        Then specific respose verification "firstName;lastName;profile"