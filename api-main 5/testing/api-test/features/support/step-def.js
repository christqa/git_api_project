const { Given, When, Then } = require('@cucumber/cucumber');
const {
  setValidAuth0Token,
  setInvalidAuth0Token,
  setHeaders,
  setEndpoint,
  setUrl,
  setRequest,
  setExpectedResponse,
  replaceInRequestJson,
  replaceInExpResponseJson,
  makeRequest,
  verifyStatusCode,
  verifyMessage,
  assignResponseAsVariable,
  assignVariable,
  verifyNodeValue,
  verifyNodeType,
  expectResponse,
  verifyResponseSchemaSnaphhot,
  verifyResponseJSONSnaphhot,
  expectResponseSpecific,
  setExpectedResponseWithDate,
  setExpectedRequestWithDate,
  setUpdateGuid,
  expectResponseWithReadMessages,
  expectResponseWithDeletedMessages,
  expectResWithUnReadMessagesAsRead,
  expectResponseWithUrineStoolFrequency,
  updateExpectedFrequency,
  upSertUrineRequest,
  upStoolSertRequest,
  setUrineStoolRequest,
  setAnalytesManualRequest,
} = require('./core-functions/core-functions.js');

const { setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(60 * 1000);
// _____________________STEPS________________________________
Given('token {string}', async (tokenType) => {
  await setHeaders(tokenType);
});

Given('resource {string}', (userResource) => {
  setEndpoint(userResource);
});

Given('endpoint {string}', (userUrl) => {
  setUrl(userUrl);
});

Given('request {string}', async (userRequest) => {
  setRequest(userRequest);
});

Given('request with date {string}', (userRequest) => {
  setExpectedRequestWithDate(userRequest);
});

Given('request update guid {string}', (userRequest) => {
  setUpdateGuid(userRequest);
});

Given('upsert urine request {string}', (userRequest) => {
  upSertUrineRequest(userRequest);
});

Given('set urine stool request {string}', (userRequest) => {
  setUrineStoolRequest(userRequest);
});

Given('upsert stool request {string}', (userRequest) => {
  upStoolSertRequest(userRequest);
});

Given('set analytes-manual request {string}', (userRequest) => {
  setAnalytesManualRequest(userRequest);
});

Given('exp response {string}', (userRequest) => {
  setExpectedResponse(userRequest);
});

Given('exp response with date {string}', (userRequest) => {
  setExpectedResponseWithDate(userRequest);
});

Given('override request {string} = {string}', (nodes, values) => {
  replaceInRequestJson(nodes, values);
});

Given('override request {string} = {int}', (node, value) => {
  replaceInRequestJson(node, value);
});

Given('override exp response {string} = {string}', (nodes, values) => {
  replaceInExpResponseJson(nodes, values);
});

Given('override exp response {string} = {int}', (node, value) => {
  replaceInExpResponseJson(node, value);
});

When('method {string}', async (method) => {
  await makeRequest(method);
});

When('valid-authentication', async () => {
  await setValidAuth0Token();
});

When('invalid-authentication', () => {
  setInvalidAuth0Token();
});

Then('status {int}', (statusCode) => {
  verifyStatusCode(statusCode);
});

Then('message {string}', (message) => {
  verifyMessage(message);
});

When('def {string} = {string}', (varNames, nodeNames) => {
  assignResponseAsVariable(varNames, nodeNames);
});

When('var {string} = {string}', (varNames, assignValues) => {
  assignVariable(varNames, assignValues);
});

When('var {string} = {int}', (varName, assignValue) => {
  assignVariable(varName, assignValue);
});

Then('expect {string} == {string}', (node, value) => {
  verifyNodeValue(node, value);
});

Then('expect {string} == {int}', (node, value) => {
  verifyNodeValue(node, value);
});

Then('expect {string} of type {string}', (node, value) => {
  verifyNodeType(node, value);
});

Then('verify response', () => {
  expectResponse();
});

Then('snapshot schema {string}', (fileName) => {
  verifyResponseSchemaSnaphhot(fileName);
});

Then('snapshot response {string}', (fileName) => {
  verifyResponseJSONSnaphhot(fileName);
});

Then('specific respose verification {string}', (responseValues) => {
  expectResponseSpecific(responseValues);
});

Then('verify readMessages {string}', (responseValues) => {
  expectResponseWithReadMessages(responseValues);
});

Then('verify message deleted {string}', (responseValues) => {
  expectResponseWithDeletedMessages(responseValues);
});

Then('verify messages as read', () => {
  expectResWithUnReadMessagesAsRead();
});

Then('update expectedFrequency {string}', (filePath) => {
  updateExpectedFrequency(filePath);
});

Then('verify urine-stool response {string}', (userRequest) => {
  expectResponseWithUrineStoolFrequency(userRequest);
});
// _____________________STEPS END________________________________
