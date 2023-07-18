## Functions

<dl>
<dt><a href="#setEndpoint">setEndpoint(resource)</a></dt>
<dd><p>To set the endpoint from baseUrl and the resource passed to the function. Endpoint = baseUrl + resource</p>
</dd>
<dt><a href="#setUrl">setUrl(url)</a></dt>
<dd><p>To set the url endpoint.</p>
</dd>
<dt><a href="#setRequest">setRequest(request)</a></dt>
<dd><p>To set the request parameters or request payload. This is an optional step.</p>
</dd>
<dt><a href="#makeRequest">makeRequest(method)</a></dt>
<dd><p>Makes a async request to the API service. This results in getting a response from the API service. Must call step resource &quot;/resource&quot; first.</p>
</dd>
<dt><a href="#verifyStatusCode">verifyStatusCode(status)</a></dt>
<dd><p>Verifies the status of the API call.</p>
</dd>
<dt><a href="#verifyMessage">verifyMessage(message)</a></dt>
<dd><p>Verifies the status of the API call.</p>
</dd>
<dt><a href="#verifyNodeValue">verifyNodeValue(nodeName, expVal)</a></dt>
<dd><p>Verifies the actual value of response against expected value.</p>
</dd>
<dt><a href="#verifyNodeType">verifyNodeType(nodeNames, expVals)</a></dt>
<dd><p>Verifies the data type of the response node.</p>
</dd>
<dt><a href="#assignResponseAsVariable">assignResponseAsVariable(varNames, nodeNames)</a></dt>
<dd><p>Save the value of the response node to a variable.</p>
</dd>
<dt><a href="#assignVariable">assignVariable(varNames, assignValues)</a></dt>
<dd><p>Creates and assigns the value of variable(s).</p>
</dd>
<dt><a href="#replaceInRequestJson">replaceInRequestJson(nodes, values)</a></dt>
<dd><p>Replace the node value in request by replacing it with variable or value.</p>
</dd>
<dt><a href="#setExpectedResponse">setExpectedResponse(expRes)</a></dt>
<dd><p>To set the expected response parameters. This is an optional step.</p>
</dd>
<dt><a href="#replaceInExpResponseJson">replaceInExpResponseJson(nodes, values)</a></dt>
<dd><p>Replace the node value in expected response by replacing it with variable or value.</p>
</dd>
<dt><a href="#setHeaders">setHeaders(tokenType)</a></dt>
<dd><p>To set the get a token and assign header values.</p>
</dd>
<dt><a href="#verifyResponseSchemaSnaphhot">verifyResponseSchemaSnaphhot(uniqueSchemaName)</a></dt>
<dd><p>To verify the response schema using snapshots from previous API calls.</p>
</dd>
<dt><a href="#verifyResponseJSONSnaphhot">verifyResponseJSONSnaphhot(uniqResponseFileName)</a></dt>
<dd><p>To verify the response JSON using snapshots from previous API calls.</p>
</dd>
</dl>

<a name="setEndpoint"></a>

## setEndpoint(resource)

To set the endpoint from baseUrl and the resource passed to the function. Endpoint = baseUrl + resource

**Kind**: global function

| Param    | Type                | Description                                    |
| -------- | ------------------- | ---------------------------------------------- |
| resource | <code>string</code> | Resource name of the API service to be called. |

**Example**

```js
Given resource "/createUser" // Sets endpoint = baseUrl + "/createUser". Example: https://mybaseUrl/createUser
```

**Example**

```js
Given resource "/user/{id}"  // Reads value of variable {id} that was defined from the previous response and sets the endpoint. Example: {id} = 1 then  endpoint = baseUrl + "/user/1"
```

**Example**

```js
Given resource "/user/all"   // Sets endpoint = baseUrl + "/user/all". Example: https://mybaseUrl/user/all
```

<a name="setUrl"></a>

## setUrl(url)

To set the url endpoint.

**Kind**: global function

| Param | Type                | Description                                    |
| ----- | ------------------- | ---------------------------------------------- |
| url   | <code>string</code> | Resource name of the API service to be called. |

**Example**

```js
Given endpoint "http://localhost/createUser" // Sets url endpoint to http://localhost/createUser
```

**Example**

```js
Given endpoint "http://localhost/user/{id}"  // Reads value of variable {id} that was defined from the previous response and sets the url endpoint. Example: {id} = 1 then  url = http://localhost/user/1
```

<a name="setRequest"></a>

## setRequest(request)

To set the request parameters or request payload. This is an optional step.

**Kind**: global function

| Param   | Type                | Description                                                                            |
| ------- | ------------------- | -------------------------------------------------------------------------------------- |
| request | <code>string</code> | JSON like string {"id": 1, "firstName": "John"}. Use single quotes ('') to pass value. |

**Example**

```js
Given request '{"id": 1, "firstName": "John"}'  // Automatically sets get parameters. Example: https://mybaseUrl/resource?id=1&firstName=John
```

**Example**

```js
Given request '{"id": 3, "lastName": "Doe"}'    // Automatically assigns request payload body to JSON {"id": 3, "lastName": "Doe"}
```

**Example**

```js
Given request 'mySampleData.json'               // Loads json file 'mySampleData.json' and assigns request payload body to the content of the loaded json file.
```

<a name="makeRequest"></a>

## makeRequest(method)

Makes a async request to the API service. This results in getting a response from the API service. Must call step resource "/resource" first.

**Kind**: global function

| Param  | Type                | Description                                                                        |
| ------ | ------------------- | ---------------------------------------------------------------------------------- |
| method | <code>string</code> | Name of the method that you want to call. It can take get, post, put, delete, etc. |

**Example**

```js
When method "get"   // Makes a get call to the endpoint set by resource "/resource" step.
```

**Example**

```js
When method "post"  // Makes a post call to the endpoint set by resource "/resource" step.
```

**Example**

```js
When method "put"   // Makes a put call to the endpoint set by resource "/resource" step.
```

<a name="verifyStatusCode"></a>

## verifyStatusCode(status)

Verifies the status of the API call.

**Kind**: global function

| Param  | Type                | Description                            |
| ------ | ------------------- | -------------------------------------- |
| status | <code>number</code> | Expected status of API call as number. |

**Example**

```js
Then status 500     //Verifies response has a status code 500
```

**Example**

```js
Then status 404     //Verifies response has a status code 404
```

**Example**

```js
Then status 200     //Verifies response has a status code 200
```

<a name="verifyMessage"></a>

## verifyMessage(message)

Verifies the status of the API call.

**Kind**: global function

| Param   | Type                | Description                   |
| ------- | ------------------- | ----------------------------- |
| message | <code>number</code> | Expected Message of API call. |

**Example**

```js
Then message "Some error message"     //Verifies response has a message "Some error message"
```

<a name="verifyNodeValue"></a>

## verifyNodeValue(nodeName, expVal)

Verifies the actual value of response against expected value.

**Kind**: global function

| Param    | Type                | Description                                                               |
| -------- | ------------------- | ------------------------------------------------------------------------- |
| nodeName | <code>string</code> | Node name of the response in dot operator. Can be body.id or just id.     |
| expVal   | <code>string</code> | Expected string value of the node. Or Expected integer value of the node. |

**Example**

```js
Then expect "firstName" == "John"       //Verifies that the response node "firstName" has a value "John".
```

**Example**

```js
Then expect "body.firstName" == "John"  //Verifies that the response node "firstName" has a value "John".
```

**Example**

```js
Then expect "id" == 1                   //Verifies that the response node "id" has a number value 1.
```

**Example**

```js
Then expect "ids" == "Array(1,2,3)"     //Verifies that the response node "ids" has an array value [1,2,3].
```

<a name="verifyNodeType"></a>

## verifyNodeType(nodeNames, expVals)

Verifies the data type of the response node.

**Kind**: global function

| Param     | Type                | Description                                                                                                 |
| --------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| nodeNames | <code>string</code> | Node names of the response in dot operator and can be separated by semicolon(;). Can be body.id or just id. |
| expVals   | <code>string</code> | Expected data types for the respective nodes. Types can be string, number, array, object etc.               |

**Example**

```js
Then expect "body.id; body.firstName" of type "number; string"  // Verifies response node 'id' is of type number and node 'firstName' is of type string.
```

**Example**

```js
Then expect "id; firstName" of type "number; string"            // Verifies response node 'id' is of type number and node 'firstName' is of type string.
```

**Example**

```js
Then expect "cities; countries" of type "array; array"          // Verifies response node 'cities' is of type array and node 'countries' is of type array.
```

<a name="assignResponseAsVariable"></a>

## assignResponseAsVariable(varNames, nodeNames)

Save the value of the response node to a variable.

**Kind**: global function

| Param     | Type                | Description                                                                                                 |
| --------- | ------------------- | ----------------------------------------------------------------------------------------------------------- |
| varNames  | <code>string</code> | Names of the variable(s) inside curely braces ({}) separated by semicolon(;).                               |
| nodeNames | <code>string</code> | Node names of the response in dot operator and can be separated by semicolon(;). Can be body.id or just id. |

**Example**

```js
When def "{id}" = "body.id"                      // Defines a variable name {id} and assigns the value of response node 'id'.
```

**Example**

```js
When def "{id}; {firstName}" = "id; firstName"   // Defines variables name {id} and {firstName} and assigns the values of response nodes 'id' and 'firstName' respectively.
```

<a name="assignVariable"></a>

## assignVariable(varNames, assignValues)

Creates and assigns the value of variable(s).

**Kind**: global function

| Param        | Type                | Description                                                                               |
| ------------ | ------------------- | ----------------------------------------------------------------------------------------- |
| varNames     | <code>string</code> | Names of the variable(s) inside curely braces ({}) separated by semicolon(;).             |
| assignValues | <code>string</code> | Value(s) to assign to the variable(s) separated by semicolon(;) for more than one values. |

**Example**

```js
When var "{id}" = "Number(1)"                      // Defines a variable name {id} and assigns the value integer 1.
```

**Example**

```js
When var "{countries}" = 'Array("usa", "canada", "mexico")'     // Defines a variable name {countries} and assigns an array value ["usa", "canada", "mexico"].
```

**Example**

```js
When var "{id}" = 3                      // Defines a variable name {id} and assigns the value integer 3.
```

**Example**

```js
When var "{id}; {firstName}" = "Number(2); John"   // Defines variables name {id} and {firstName} and assigns integer 2 and string John respectively.
```

<a name="replaceInRequestJson"></a>

## replaceInRequestJson(nodes, values)

Replace the node value in request by replacing it with variable or value.

**Kind**: global function

| Param  | Type                | Description                                                                            |
| ------ | ------------------- | -------------------------------------------------------------------------------------- |
| nodes  | <code>string</code> | Node names of the request in dot operator and can be separated by semicolon(;).        |
| values | <code>string</code> | value(s) of the request node(s) to be replaced with. can be separated by semicolon(;). |

**Example**

```js
When override request "id; firstName" = "{id}; {firstName}"           // Replaces value of request node 'id' and 'firstName' to variable values {id} and {firstName} respectively.
```

**Example**

```js
When override request "id; firstName" = "{id}; SomeValue"             // Replaces value of request node 'id' and 'firstName' to variable value {id} and string "SomeValue"  respectively.
```

**Example**

```js
When override request "id; firstName" = "Number(1); SomeOtherValue"   // Replaces value of request node 'id' and 'firstName' to number 1 and string "SomeOtherValue" respectively.
```

<a name="setExpectedResponse"></a>

## setExpectedResponse(expRes)

To set the expected response parameters. This is an optional step.

**Kind**: global function

| Param  | Type                | Description                                                                            |
| ------ | ------------------- | -------------------------------------------------------------------------------------- |
| expRes | <code>string</code> | JSON like string {"id": 1, "firstName": "John"}. Use single quotes ('') to pass value. |

**Example**

```js
Given exp response '{"id": 3, "lastName": "Doe"}'    // Assigns expected response body to JSON {"id": 3, "lastName": "Doe"}
```

**Example**

```js
Given exp response 'mySampleData.json'               // Loads json file 'mySampleData.json' and assigns it to expected response body.
```

<a name="replaceInExpResponseJson"></a>

## replaceInExpResponseJson(nodes, values)

Replace the node value in expected response by replacing it with variable or value.

**Kind**: global function

| Param  | Type                | Description                                                                                      |
| ------ | ------------------- | ------------------------------------------------------------------------------------------------ |
| nodes  | <code>string</code> | Node names of the expected response in dot operator and can be separated by semicolon(;).        |
| values | <code>string</code> | value(s) of the expected response node(s) to be replaced with. can be separated by semicolon(;). |

**Example**

```js
Given override exp response "id; firstName" = "{id}; {firstName}"           // Replaces value of expected response node 'id' and 'firstName' to variable values {id} and {firstName} respectively.
```

**Example**

```js
Given override exp response "id; firstName" = "{id}; SomeValue"             // Replaces value of expected response node 'id' and 'firstName' to variable value {id} and string "SomeValue"  respectively.
```

**Example**

```js
Given override exp response "id; firstName" = "Number(1); SomeOtherValue"   // Replaces value of expected response node 'id' and 'firstName' to number 1 and string "SomeOtherValue" respectively.
```

<a name="setHeaders"></a>

## setHeaders(tokenType)

To set the get a token and assign header values.

**Kind**: global function

| Param     | Type                | Description                                            |
| --------- | ------------------- | ------------------------------------------------------ |
| tokenType | <code>string</code> | Token type can be 'valid' , 'invalid', 'none', 'null'. |

**Example**

```js
Given token 'invalid'   // Assigns the request header with an invalid Bearer token.
```

**Example**

```js
Given token 'valid'     // Assigns the request header with a valid Bearer token.
```

**Example**

```js
Given token 'null'      // Assigns the request header with no Bearer token.
```

<a name="verifyResponseSchemaSnaphhot"></a>

## verifyResponseSchemaSnaphhot(uniqueSchemaName)

To verify the response schema using snapshots from previous API calls.

**Kind**: global function

| Param            | Type                | Description                                       |
| ---------------- | ------------------- | ------------------------------------------------- |
| uniqueSchemaName | <code>string</code> | Unique file name to save the JSON schema snapshot |

**Example**

```js
Given snapshot schema 'scenario3'   // Takes the snapshot of the response JSON schema and validates against future responses.
```

<a name="verifyResponseJSONSnaphhot"></a>

## verifyResponseJSONSnaphhot(uniqResponseFileName)

To verify the response JSON using snapshots from previous API calls.

**Kind**: global function

| Param                | Type                | Description                                |
| -------------------- | ------------------- | ------------------------------------------ |
| uniqResponseFileName | <code>string</code> | Unique file name to save the JSON snapshot |

**Example**

```js
Given snapshot response 'scenario3'   // Takes the snapshot of the response JSON and validates against future responses.
```
