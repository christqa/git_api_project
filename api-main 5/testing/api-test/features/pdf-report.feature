Feature: PDF Report - API Test Suite
   @PDF_REPORT
    Scenario: Get PDF Report
        Given resource "/pdf-report"
        And token "invalid"
        And request "/pdf-report/get-pdf-report.json"
        When method "get"
        Then status 401
