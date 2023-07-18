const { delimiter } = require('../common.js');
let {
  res,
  request,
  expResponse,
  getNodeName,
  replaceVar,
  requestDir,
} = require('../common.js');
const {
  evaluateValue,
  snapshotResponseSchema,
  snapshotResponse,
  loadFile,
} = require('../utility.js');

const expect = require('chai').expect;
/**
 * @param {number} status Expected status of API call as number.
 * @description Verifies the status of the API call.
 * @example Then status 500     //Verifies response has a status code 500
 * @example Then status 404     //Verifies response has a status code 404
 * @example Then status 200     //Verifies response has a status code 200
 */
module.exports.verifyStatusCode = (exp) => {
  const act = res.value.res.statusCode;
  let actualReq =
    request.value !== null
      ? `Request Sent: ${JSON.stringify(request.value)}\n`
      : 'No request body or parameters.';
  expect(
    act,
    `Expected status code to be ${exp} but got ${act} \n${actualReq}Response Recieved:\n${JSON.stringify(
      res.value.res.body
    )}\n\n`
  ).to.be.equal(exp);
};

/**
 * @param {number} message Expected Message of API call.
 * @description Verifies the status of the API call.
 * @example Then message "Some error message"     //Verifies response has a message "Some error message"
 */
module.exports.verifyMessage = (exp) => {
  const act = res.value.res.body.message;
  let actualReq =
    request.value !== null
      ? `Request Sent: ${request.value}\n`
      : 'No request body or parameters.';
  expect(
    act,
    `Expected status code to be ${exp} but got ${act} \n${actualReq}Response Recieved:\n${JSON.stringify(
      res.value.res.body
    )}\n\n`
  ).to.be.equal(exp);
};

/**
 * @param {string} nodeName Node name of the response in dot operator. Can be body.id or just id.
 * @param {string} expVal Expected string value of the node. Or Expected integer value of the node.
 * @description Verifies the actual value of response against expected value.
 * @example Then expect "firstName" == "John"       //Verifies that the response node "firstName" has a value "John".
 * @example Then expect "body.firstName" == "John"  //Verifies that the response node "firstName" has a value "John".
 * @example Then expect "id" == 1                   //Verifies that the response node "id" has a number value 1.
 * @example Then expect "ids" == "Array(1,2,3)"     //Verifies that the response node "ids" has an array value [1,2,3].
 */
module.exports.verifyNodeValue = (nodeNames, expVals) => {
  if (typeof expVals === 'number' && !isNaN(expVals)) {
    let node = getNodeName(nodeNames);
    expect(
      eval(node),
      `Value of response node "${nodeNames}" expected to be equal to ${expVals} but got ${eval(
        node
      )}`
    ).to.eql(expVals);
  } else {
    const nodeNamesArray = nodeNames.split(delimiter);
    const expValsArray = expVals.split(delimiter);
    nodeNamesArray.forEach(function (nodeName, index) {
      let expVal = evaluateValue(replaceVar(expValsArray[index].trim()));
      let node = getNodeName(nodeName);
      expect(
        eval(node),
        `Value of response node "${nodeName}" expected to be equal to ${expVal} but got "${eval(
          node
        )}"`
      ).to.eql(expVal);
    });
  }
};

/**
 * @param {string} nodeNames Node names of the response in dot operator and can be separated by semicolon(;). Can be body.id or just id.
 * @param {string} expVals Expected data types for the respective nodes. Types can be string, number, array, object etc.
 * @description Verifies the data type of the response node.
 * @example Then expect "body.id; body.firstName" of type "number; string"  // Verifies response node 'id' is of type number and node 'firstName' is of type string.
 * @example Then expect "id; firstName" of type "number; string"            // Verifies response node 'id' is of type number and node 'firstName' is of type string.
 * @example Then expect "cities; countries" of type "array; array"          // Verifies response node 'cities' is of type array and node 'countries' is of type array.
 */
module.exports.verifyNodeType = (nodeNames, expVals) => {
  const nodeNamesArray = nodeNames.split(delimiter);
  const expValsArray = expVals.split(delimiter);
  nodeNamesArray.forEach(function (nodeName, index) {
    let expVal = expValsArray[index].trim();
    let node = getNodeName(nodeName);
    expect(
      eval(node),
      `Response node "${nodeName}" expected to be of type ${expVal} but got ${typeof eval(
        node
      )}`
    ).to.be.a(expVal);
  });
};

/**=.*
 * @param {string} uniqueSchemaName Unique file name to save the JSON schema snapshot
 * @description To verify the response schema using snapshots from previous API calls.
 * @example Given snapshot schema 'scenario3'   // Takes the snapshot of the response JSON schema and validates against future responses.
 */
module.exports.verifyResponseSchemaSnaphhot = (uniqueSchemaName) => {
  snapshotResponseSchema(res.value.res.body, uniqueSchemaName);
};

/**
 * @param {string} uniqResponseFileName Unique file name to save the JSON snapshot
 * @description To verify the response JSON using snapshots from previous API calls.
 * @example Given snapshot response 'scenario3'   // Takes the snapshot of the response JSON and validates against future responses.
 */
module.exports.verifyResponseJSONSnaphhot = (uniqResponseFileName) => {
  snapshotResponse(res.value.res.body, uniqResponseFileName);
};

/**
 * @description To verify the response JSON with expected json. Must define an expected response before calling this step.
 * @example Then expect response
 */
module.exports.expectResponse = () => {
  //  console.log(res.value.res.body);
  //  console.log(JSON.parse(expResponse.value));
  expect(res.value.res.body).to.be.deep.equal(JSON.parse(expResponse.value));
};

module.exports.expectResponseSpecific = (responseValues) => {
  const words = responseValues.trim().split(';');
  let newResponse = {};
  let newIncomingResponse = {};
  words.map((element, index) => {
    newResponse[words[index]] = JSON.parse(expResponse.value)[words[index]];
    newIncomingResponse[words[index]] = res.value.res.body[words[index]];
  });
  delete newIncomingResponse.profile.userId;
  expect(newIncomingResponse).to.be.deep.equal(newResponse);
};

module.exports.expectResponseWithReadMessages = (responseValues) => {
  const words = responseValues.trim().split(';');
  expect({
    read: res.value.res.body.read,
    deleted: res.value.res.body.deleted,
  }).to.be.deep.equal({
    read: eval(words[0]),
    deleted: eval(words[1]),
  });
};

module.exports.expectResponseWithDeletedMessages = (responseValues) => {
  const words = responseValues.trim().split(';');
  let messages = res.value.res.body.message.filter(
    (value) => value.messageGuid === words[0]
  );
  const incomingRes = {
    read: messages[0].read,
    deleted: messages[0].deleted != null,
  };
  expect(incomingRes).to.be.deep.equal({
    read: eval(words[1]),
    deleted: words[2] != null,
  });
};

module.exports.expectResWithUnReadMessagesAsRead = () => {
  const messages = res.value.res.body.message.filter(
    (value) => value.read === false
  );
};

module.exports.expectResponseWithUrineStoolFrequency = (userRequest) => {
  let fileData = loadFile(`${requestDir}/${userRequest}`, false);
  if (fileData === null) {
    request.value = userRequest;
  } else {
    request.value = JSON.parse(fileData);
  }
  expect(res.value.res.body[0]).to.be.deep.equal(request.value);
};
