Feature: Automate post, get, delete, read and mark all read messages and unread messages

    Background: provide valid token
        Given token "valid"
     
    Scenario:"post to internal api /internal/messages read message"
        Given resource "/users/me"
        And method "get"
        And request update guid "/messages/internal-messages-read.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204

    Scenario:"post to internal api /internal/messages unread message 1"
        Given resource "/users/me"
        And method "get"
        And request update guid "/messages/internal-messages-unread1.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204

    Scenario:"post to internal api /internal/messages unread message 2"
        Given resource "/users/me"
        And method "get"
        And request update guid "/messages/internal-messages-unread2.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204

    Scenario:"post to internal api /internal/messages unread message 3"

        Given resource "/users/me"
        And method "get"
        And request update guid "/messages/internal-messages-unread3.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204

    Scenario:"post to internal api /internal/messages unread message 4"
        Given resource "/users/me"
        And method "get"
        And request update guid "/messages/internal-messages-unread4.json"
        And resource "/internal/messages"
        When method "post"
        Then status 204

    @SW-1717
    Scenario:"Verify message is read=true and deleted=null for the endpoint GET/messages/{messageGuid}"
        Given resource "/messages/ef9b5219-6e1b-4ba7-a225-0c1b8feab231"
        When method "get"
        Then verify readMessages "true;null"
    @SW-1717
    Scenario:"Delete the read message"
        Given resource "/messages/ef9b5219-6e1b-4ba7-a225-0c1b8feab231"
        When method "delete"
        Then status 204
    @SW-1717
    Scenario:"Verify the read message is deleted and read"
        Given resource "/messages"
        And request "/messages/delete-message-params.json"
        When method "get"
        Then verify message deleted "ef9b5219-6e1b-4ba7-a225-0c1b8feab231;true;notnull"





    @SW-1717
    Scenario:"Verify message1 is read=false and deleted=null for the endpoint GET/messages/{messageGuid}"
        Given resource "/messages/1d79c754-3ae0-4d8d-93f7-c9b1bfd85aeb"
        When method "get"
        Then verify readMessages "false;null"
    @SW-1717
    Scenario:"mark the message1 read before delete":
        Given resource "/messages/1d79c754-3ae0-4d8d-93f7-c9b1bfd85aeb/read"
        When method "patch"
        Then status 204
    @SW-1717
    Scenario:"Delete the unread message1"
        Given resource "/messages/1d79c754-3ae0-4d8d-93f7-c9b1bfd85aeb"
        When method "delete"
        Then status 204

    @SW-1717
    Scenario:"Verify the unread message1 is deleted and read"
        Given resource "/messages"
        And request "/messages/delete-message-params.json"
        When method "get"
        Then verify message deleted "1d79c754-3ae0-4d8d-93f7-c9b1bfd85aeb;true;notnull"




    @SW-1717
    Scenario:"Verify message2 is read=false and deleted=null for the endpoint GET/messages/{messageGuid}"
        Given resource "/messages/66996a7d-1900-4f6d-a872-a61a8d0c55ea"
        When method "get"
        Then verify readMessages "false;null"
    @SW-1717
    Scenario:"mark the message2 read before delete":
        Given resource "/messages/66996a7d-1900-4f6d-a872-a61a8d0c55ea/read"
        When method "patch"
        Then status 204
    @SW-1717
    Scenario:"Delete the unread message2"
        Given resource "/messages/66996a7d-1900-4f6d-a872-a61a8d0c55ea"
        When method "delete"
        Then status 204
    @SW-1717
    Scenario:"Verify the unread message2 is deleted and read"
        Given resource "/messages"
        And request "/messages/delete-message-params.json"
        When method "get"
        Then verify message deleted "66996a7d-1900-4f6d-a872-a61a8d0c55ea;true;notnull"



 
    @SW-1717
    Scenario:"Verify message3 is read=false and deleted=null for the endpoint GET/messages/{messageGuid}"
        Given resource "/messages/12cb193d-a52d-4bd9-9b60-a3d3bb57bfbd"
        When method "get"
        Then verify readMessages "false;null"
    @SW-1717
    Scenario:"mark the message3 read before delete":
        Given resource "/messages/12cb193d-a52d-4bd9-9b60-a3d3bb57bfbd/read"
        When method "patch"
        Then status 204
    @SW-1717
    Scenario:"Delete the unread message3"
        Given resource "/messages/12cb193d-a52d-4bd9-9b60-a3d3bb57bfbd"
        When method "delete"
        Then status 204
    @SW-1717
    Scenario:"Verify the unread message3 is deleted and read"
        Given resource "/messages"
        And request "/messages/delete-message-params.json"
        When method "get"
        Then verify message deleted "12cb193d-a52d-4bd9-9b60-a3d3bb57bfbd;true;notnull"




    @SW-1717
    Scenario:"Verify message4 is read=false and deleted=null for the endpoint GET/messages/{messageGuid}"
        Given resource "/messages/4ffc4403-0ef5-4ec4-90ec-43b1d336e738"
        When method "get"
        Then verify readMessages "false;null"
  
    @SW-1717
    Scenario:"mark the message4 read before delete":
        Given resource "/messages/4ffc4403-0ef5-4ec4-90ec-43b1d336e738/read"
        When method "patch"
        Then status 204
    @SW-1717
    Scenario:"Delete the unread message4"
        Given resource "/messages/4ffc4403-0ef5-4ec4-90ec-43b1d336e738"
        When method "delete"
        Then status 204
    @SW-1717
    Scenario:"Verify the unread message4 is deleted and read"
        Given resource "/messages"
        And request "/messages/delete-message-params.json"
        When method "get"
        Then verify message deleted "4ffc4403-0ef5-4ec4-90ec-43b1d336e738;true;notnull"
