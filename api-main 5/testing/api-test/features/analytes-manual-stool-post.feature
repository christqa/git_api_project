Feature: POST/analyte-manual-stool 

    Background: provide valid token
        Given token "valid"

    Scenario:Create Upsert-stool
        Given resource "/users/me"
        And method "get"
        And upsert stool request "/stool/upsert-stool.json"

    Scenario: Upsert-stool.json
        Given resource "/stools"
        And request "/stool/upsert-stool.json"
        When method "put"
        Then status 204
    
    Scenario:Add frequncy request
        Given resource "/stools"
        And set urine stool request "/stool/get-stool.json"
        And request "/stool/get-stool.json"
        When method "get"
        Then update expectedFrequency "/stool/expectedFrequency.json"

    @SW-1715
    Scenario: Post to analytes-manual isStool=true
        Given resource "/analytes-manual"
        And set analytes-manual request "/analytes-manual/analytes-manual-stool-post.json;stool"
        And request "/analytes-manual/analytes-manual-stool-post.json"
        When method "post"
        Then status 204
        
    @SW-1715
    Scenario:Checking if stool frequency is increased by one
        Given resource "/stools"
        And request "/stool/get-stool.json"
        When method "get"
        Then verify urine-stool response "/stool/expectedFrequency.json"
    
    
        