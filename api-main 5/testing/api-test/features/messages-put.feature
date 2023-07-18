Feature: PUT/messages/mark-all-as-read

    Scenario:"post to internal api /internal/messages unread message 6"
        Given resource "/users/me"
        And token "valid"
        And method "get"
        And request update guid "/messages/internal-messages-unread6.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204

    Scenario:"post to internal api /internal/messages unread message 7 "
        Given resource "/users/me"
        And token "valid"
        And method "get"
        And request update guid "/messages/internal-messages-unread7.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204

    Scenario:"post to internal api /internal/messages unread message 8"
        Given resource "/users/me"
        And token "valid"
        And method "get"
        And request update guid "/messages/internal-messages-unread8.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204
    @SW-1717
    Scenario:"post to internal api /internal/messages unread message 9"
        Given resource "/users/me"
        And token "valid"
        And method "get"
        And request update guid "/messages/internal-messages-unread9.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204
    @SW-1717
    Scenario:"Mark all unread messages as read":
        Given resource "/messages/mark-all-as-read"
        And token "valid"
        When method "put"
        Then status 204
    @SW-1717
    Scenario:"Verify that all unread messages are marked as read"
        Given resource "/messages"
        And token "valid"
        And request "/messages/unread-messages-params.json"
        When method "get"
        Then verify messages as read