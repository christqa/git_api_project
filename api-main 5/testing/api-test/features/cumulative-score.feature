Feature: Cumulative Scores - API Test Suite
   @CUMULATIVE_SCORE
    Scenario: Check cumulative-score
        Given resource "/cumulative-scores"
        And token "invalid"
        And request "/cumulative-scores/get-cumulative-score.json"
        When method "get"
        Then status 401