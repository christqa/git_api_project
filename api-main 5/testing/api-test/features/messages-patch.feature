Feature: Automate PATCH/messages/{messageGuid}/read

    Background: provide valid token
        Given token "valid"

    Scenario:"post to internal api /internal/messages unread message"
        Given resource "/users/me"
        And method "get"
        And request update guid "/messages/internal-messages-unread5.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204
    @SW-1717
    Scenario:"Verify message is read=false and deleted=null for the endpoint GET/messages/{messageGuid}"
        Given resource "/messages/900a67de-2366-4222-b311-9e7e01f7a1a4"
        When method "get"
        Then verify readMessages "false;null"
    @SW-1717
    Scenario:"mark the message as read ":
        Given resource "/messages/900a67de-2366-4222-b311-9e7e01f7a1a4/read"
        When method "patch"
        Then status 204
    @SW-1717 
    Scenario:"Verify message is read=true and deleted=null for the endpoint GET/messages/{messageGuid}"
        Given resource "/messages/900a67de-2366-4222-b311-9e7e01f7a1a4"
        When method "get"
        Then verify readMessages "true;null"
    @SW-1717
    Scenario:"delete the message after it's creation"
        Given resource "/messages/900a67de-2366-4222-b311-9e7e01f7a1a4"
        When method "delete"
        Then status 204