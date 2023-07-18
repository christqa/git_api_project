Feature: POST/analyte-manual-urine

    Background: provide valid token
        Given token "valid"
    
    Scenario:Create Upsert-urine
        Given resource "/users/me"
        And method "get"
        And upsert urine request "/urinations/upsert-urine.json"

    Scenario: Upsert-urine.json
        Given resource "/urinations"
        And request "/urinations/upsert-urine.json"
        When method "put"
        Then status 204
    
    Scenario:Add frequncy request
        Given resource "/urinations"
        And set urine stool request "/urinations/get-urinations.json"
        And request "/urinations/get-urinations.json"
        When method "get"
        Then update expectedFrequency "/urinations/expectedFrequency.json"

    @SW-1715
    Scenario: Post to analytes-manual isUrine=true
        Given resource "/analytes-manual"
        And set analytes-manual request "/analytes-manual/analytes-manual-urine-post.json;urine"
        And request "/analytes-manual/analytes-manual-urine-post.json"
        When method "post"
        Then status 204
        
    @SW-1715
    Scenario:Checking if urination frequency is increased by one
        Given resource "/urinations"
        And request "/urinations/get-urinations.json"
        When method "get"
        Then verify urine-stool response "/urinations/expectedFrequency.json"

