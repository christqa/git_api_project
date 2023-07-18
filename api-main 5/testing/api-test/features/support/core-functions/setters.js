const {
  config,
  delimiter,
  baseUrl,
  responseDir,
  requestDir,
  getFormattedDate,
  getDate_,
} = require('../common.js');
let {
  res,
  resource,
  url,
  headers,
  auth0Token,
  request,
  variable,
  expResponse,
  getNodeName,
  convertToJSON,
  replaceVar,
  calculateEighteenYearsOfAge,
} = require('../common.js');

const { loadFile, evaluateValue } = require('../utility.js');
const { assert } = require('chai');

const axios = require('axios');
const qs = require('qs');
const fs = require('fs');
/**
 * @param {string} resource Resource name of the API service to be called.
 * @description To set the endpoint from baseUrl and the resource passed to the function. Endpoint = baseUrl + resource
 * @example Given resource "/createUser" // Sets endpoint = baseUrl + "/createUser". Example: https://mybaseUrl/createUser
 * @example Given resource "/user/{id}"  // Reads value of variable {id} that was defined from the previous response and sets the endpoint. Example: {id} = 1 then  endpoint = baseUrl + "/user/1"
 * @example Given resource "/user/all"   // Sets endpoint = baseUrl + "/user/all". Example: https://mybaseUrl/user/all
 */
module.exports.setEndpoint = (userResource) => {
  resource.value = replaceVar(userResource);
  url.value = baseUrl + resource.value;
};

/**
 * @param {string} url Resource name of the API service to be called.
 * @description To set the url endpoint.
 * @example Given endpoint "http://localhost/createUser" // Sets url endpoint to http://localhost/createUser
 * @example Given endpoint "http://localhost/user/{id}"  // Reads value of variable {id} that was defined from the previous response and sets the url endpoint. Example: {id} = 1 then  url = http://localhost/user/1
 */
module.exports.setUrl = (userUrl) => {
  let finalUrl = replaceVar(userUrl);
  url.value = finalUrl;
};

/**
 * @param {string} request JSON like string {"id": 1, "firstName": "John"}. Use single quotes ('') to pass value.
 * @description To set the request parameters or request payload. This is an optional step.
 * @example Given request '{"id": 1, "firstName": "John"}'  // Automatically sets get parameters. Example: https://mybaseUrl/resource?id=1&firstName=John
 * @example Given request '{"id": 3, "lastName": "Doe"}'    // Automatically assigns request payload body to JSON {"id": 3, "lastName": "Doe"}
 * @example Given request 'mySampleData.json'               // Loads json file 'mySampleData.json' and assigns request payload body to the content of the loaded json file.
 */
module.exports.setRequest = async (userRequest) => {
  let fileData = loadFile(`${requestDir}/${userRequest}`, false);
  if (fileData === null) {
    request.value = userRequest;
  } else {
    request.value = JSON.parse(fileData);
  }
};

/**
 * @param {string} expRes JSON like string {"id": 1, "firstName": "John"}. Use single quotes ('') to pass value.
 * @description To set the expected response parameters. This is an optional step.
 * @example Given exp response '{"id": 3, "lastName": "Doe"}'    // Assigns expected response body to JSON {"id": 3, "lastName": "Doe"}
 * @example Given exp response 'mySampleData.json'               // Loads json file 'mySampleData.json' and assigns it to expected response body.
 */
module.exports.setExpectedResponse = (expRes) => {
  let fileData = loadFile(`${responseDir}/${expRes}`, false);
  if (fileData === null) {
    expResponse.value = expRes;
  } else {
    expResponse.value = fileData;
  }
};

module.exports.setExpectedRequestWithDate = (userRequest) => {
  let fileData = loadFile(`${requestDir}/${userRequest}`, false);
  if (fileData === null) {
    request.value = userRequest;
  } else {
    let updatedDate = JSON.parse(fileData);
    updatedDate.body.profile.dob = calculateEighteenYearsOfAge();
    request.value = updatedDate;
  }
};

module.exports.setUpdateGuid = (userRequest) => {
  const userGuid = res.value.res.body.userGuid;
  let fileData = loadFile(`${requestDir}/${userRequest}`, false);
  if (fileData === null) {
    request.value = userRequest;
  } else {
    let updateGuid = JSON.parse(fileData);
    updateGuid.body.userGuid = userGuid;
    request.value = updateGuid;
  }
};
module.exports.setUrineStoolRequest = (filePath) => {
  let today = new Date();
  today = getFormattedDate(today);
  const newRequest = {
    parameters: {
      groupBy: 'day',
      type: 'frequency',
      endDate: today,
      startDate: today,
    },
  };
  let data = JSON.stringify(newRequest);
  fs.writeFileSync(
    `${__dirname}/../../../data/request${filePath}`,
    data,
    (error) => {
      console.log(error);
    }
  );
};
module.exports.setAnalytesManualRequest = (userRequest) => {
  userRequest = userRequest.trim().split(';');
  const filePath = userRequest[0];
  const excreteType = userRequest[1];
  let today = getDate_(new Date());
  const newRequest = {
    body: {
      beginning: today,
      end: today,
      isUrine: excreteType === 'urine' ? true : false,
      isStool: excreteType === 'stool' ? true : false,
    },
  };
  let data = JSON.stringify(newRequest);
  fs.writeFileSync(
    `${__dirname}/../../../data/request${filePath}`,
    data,
    (error) => {
      console.log(error);
    }
  );
};
module.exports.upSertUrineRequest = (filePath) => {
  const userMail = res.value.res.body.email;
  let today = getDate_(new Date());
  const newRequest = {
    path: `/${userMail}/`,
    parameters: { deleteData: false },
    body: [
      {
        data: [
          {
            startDate: today,
            endDate: today,
            color: 3,
            concentration: 1,
            durationInSeconds: 300,
          },
          {
            startDate: today,
            endDate: today,
            color: 3,
            concentration: 1,
            durationInSeconds: 300,
          },
        ],
      },
    ],
  };

  let data = JSON.stringify(newRequest);
  fs.writeFileSync(
    `${__dirname}/../../../data/request${filePath}`,
    data,
    (error) => {
      console.log(error);
    }
  );
};

module.exports.upStoolSertRequest = (filePath) => {
  const userMail = res.value.res.body.email;
  let today = getDate_(new Date());
  const newRequest = {
    path: `/${userMail}/`,
    parameters: { deleteData: false },
    body: [
      {
        data: [
          {
            startDate: today,
            endDate: today,
            consistency: 3,
            color: 3,
            hasBlood: false,
            durationInSeconds: 576,
          },
          {
            startDate: today,
            endDate: today,
            consistency: 3,
            color: 3,
            hasBlood: false,
            durationInSeconds: 264,
          },
        ],
      },
    ],
  };
  let data = JSON.stringify(newRequest);
  fs.writeFileSync(
    `${__dirname}/../../../data/request${filePath}`,
    data,
    (error) => {
      console.log(error);
    }
  );
};

module.exports.upSertUrineRequest = async (filePath) => {
  const userMail = res.value.res.body.email;
  const newRequest = {
    path: `/${userMail}/`,
    parameters: { deleteData: false },
    body: [
      {
        data: [
          {
            startDate: '2022-10-04T01:56:31Z',
            endDate: '2022-10-04T01:56:31Z',
            color: 3,
            concentration: 1,
            durationInSeconds: 300,
          },
          {
            startDate: '2022-10-04T01:56:31Z',
            endDate: '2022-10-04T01:56:31Z',
            color: 3,
            concentration: 1,
            durationInSeconds: 300,
          },
        ],
      },
    ],
  };

  let data = JSON.stringify(newRequest);
  await fs.writeFile(
    `${__dirname}/../../../data/request${filePath}`,
    data,
    (error) => {
      console.log(error);
    }
  );
};

module.exports.upStoolSertRequest = async (filePath) => {
  const userMail = res.value.res.body.email;
  const newRequest = {
    path: `/${userMail}/`,
    parameters: { deleteData: false },
    body: [
      {
        data: [
          {
            startDate: '2022-10-06T03:39:57Z',
            endDate: '2022-10-06T03:39:57Z',
            consistency: 3,
            color: 3,
            hasBlood: false,
            durationInSeconds: 576,
          },
          {
            startDate: '2022-10-06T03:39:57Z',
            endDate: '2022-10-06T03:39:57Z',
            consistency: 3,
            color: 3,
            hasBlood: false,
            durationInSeconds: 264,
          },
        ],
      },
    ],
  };
  let data = JSON.stringify(newRequest);
  await fs.writeFile(
    `${__dirname}/../../../data/request${filePath}`,
    data,
    (error) => {
      console.log(error);
    }
  );
};

module.exports.setExpectedResponseWithDate = (expRes) => {
  let fileData = loadFile(`${responseDir}/${expRes}`, false);
  if (fileData === null) {
    expResponse.value = expRes;
  } else {
    let updatedDate = JSON.parse(fileData);
    updatedDate.profile.dob = calculateEighteenYearsOfAge();
    fileData = JSON.stringify(updatedDate);
    expResponse.value = fileData;
  }
};

module.exports.setThisHeaders = () => {
  headers.value = {
    Authorization: `Bearer ${auth0Token.value}`,
  };
};

/**
 * @param {string} tokenType Token type can be 'valid' , 'invalid', 'none', 'null'.
 * @description To set the get a token and assign header values.
 * @example Given token 'invalid'   // Assigns the request header with an invalid Bearer token.
 * @example Given token 'valid'     // Assigns the request header with a valid Bearer token.
 * @example Given token 'null'      // Assigns the request header with no Bearer token.
 */
module.exports.setHeaders = async (tokenType) => {
  switch (tokenType) {
    case 'valid':
      await module.exports.setValidAuth0Token();
      break;
    case 'invalid':
      auth0Token.value = 'invalid token';
      break;
    case 'none':
    case 'null':
      auth0Token.value = '';
      break;
    default:
      assert.fail(
        "Unknown token type. Token type can be 'valid', 'invalid', 'none', 'null'  "
      );
  }
  module.exports.setThisHeaders();
};

/**
 * @param {string} varNames Names of the variable(s) inside curely braces ({}) separated by semicolon(;).
 * @param {string} nodeNames Node names of the response in dot operator and can be separated by semicolon(;). Can be body.id or just id.
 * @description Save the value of the response node to a variable.
 * @example When def "{id}" = "body.id"                      // Defines a variable name {id} and assigns the value of response node 'id'.
 * @example When def "{id}; {firstName}" = "id; firstName"   // Defines variables name {id} and {firstName} and assigns the values of response nodes 'id' and 'firstName' respectively.
 */
module.exports.assignResponseAsVariable = (varNames, nodeNames) => {
  const nodeNamesArray = nodeNames.split(delimiter);
  const varNamesArray = varNames.split(delimiter);
  nodeNamesArray.forEach(function (nodeName, index) {
    variable[varNamesArray[index].trim()] = eval(getNodeName(nodeName));
  });
};

/**
 * @param {string} varNames Names of the variable(s) inside curely braces ({}) separated by semicolon(;).
 * @param {string} assignValues Value(s) to assign to the variable(s) separated by semicolon(;) for more than one values.
 * @description Creates and assigns the value of variable(s).
 * @example When var "{id}" = "Number(1)"                      // Defines a variable name {id} and assigns the value integer 1.
 * @example When var "{countries}" = 'Array("usa", "canada", "mexico")'     // Defines a variable name {countries} and assigns an array value ["usa", "canada", "mexico"].
 * @example When var "{id}" = 3                      // Defines a variable name {id} and assigns the value integer 3.
 * @example When var "{id}; {firstName}" = "Number(2); John"   // Defines variables name {id} and {firstName} and assigns integer 2 and string John respectively.
 */
module.exports.assignVariable = (varNames, assignValues) => {
  if ((typeof assignValues === 'number') & !isNaN(assignValues)) {
    variable[varNames] = assignValues;
  } else {
    const varNamesArray = varNames.split(delimiter);
    const assignValuesArray = assignValues.split(delimiter);
    varNamesArray.forEach(function (varName, index) {
      variable[varName] = evaluateValue(assignValuesArray[index]);
    });
  }
};

/**
 * @param {string} nodes Node names of the request in dot operator and can be separated by semicolon(;).
 * @param {string} values value(s) of the request node(s) to be replaced with. can be separated by semicolon(;).
 * @description Replace the node value in request by replacing it with variable or value.
 * @example When override request "id; firstName" = "{id}; {firstName}"           // Replaces value of request node 'id' and 'firstName' to variable values {id} and {firstName} respectively.
 * @example When override request "id; firstName" = "{id}; SomeValue"             // Replaces value of request node 'id' and 'firstName' to variable value {id} and string "SomeValue"  respectively.
 * @example When override request "id; firstName" = "Number(1); SomeOtherValue"   // Replaces value of request node 'id' and 'firstName' to number 1 and string "SomeOtherValue" respectively.
 * @example When override request "id" = 'Object({test: "value"})'                // Replaces value of request node 'id to JSOn object {test: "value"}.
 * @example When override request "newNode" = "SomeValue"                         // If newNode does not exist in the request, add newNode in request JSON and assign string value 'SomeValue'.
 */
module.exports.replaceInRequestJson = (nodes, values) => {
  if (request.value !== null) {
    let nodeNamesArray = null;
    let valuesArray = null;
    if ((typeof values === 'number') & !isNaN(values)) {
      //  In case of number, only one node and value can be passed to cucumber step.
      nodeNamesArray = [nodes];
      valuesArray = [values];
    } else {
      nodeNamesArray = nodes.split(delimiter);
      valuesArray = values.split(delimiter);
    }
    let tempJson = convertToJSON(request.value);
    nodeNamesArray.forEach(function (nodeName, index) {
      let keys = nodeName.split('.'),
        last = keys.pop();
      keys.reduce((o, k) => (o[k] = o[k] || {}), tempJson)[last] =
        evaluateValue(replaceVar(valuesArray[index]));
    });
    request.value = tempJson;
  } else {
    assert.fail(
      'No request JSON loaded yet.\nPlease use request step to load a json.'
    );
  }
};

/**
 * @param {string} nodes Node names of the expected response in dot operator and can be separated by semicolon(;).
 * @param {string} values value(s) of the expected response node(s) to be replaced with. can be separated by semicolon(;).
 * @description Replace the node value in expected response by replacing it with variable or value.
 * @example Given override exp response "id; firstName" = "{id}; {firstName}"           // Replaces value of expected response node 'id' and 'firstName' to variable values {id} and {firstName} respectively.
 * @example Given override exp response "id; firstName" = "{id}; SomeValue"             // Replaces value of expected response node 'id' and 'firstName' to variable value {id} and string "SomeValue"  respectively.
 * @example Given override exp response "id; firstName" = "Number(1); SomeOtherValue"   // Replaces value of expected response node 'id' and 'firstName' to number 1 and string "SomeOtherValue" respectively.
 */
module.exports.replaceInExpResponseJson = (nodes, values) => {
  if (expResponse.value !== null) {
    let nodeNamesArray = null;
    let valuesArray = null;
    if ((typeof values === 'number') & isNaN(values)) {
      //  In case of number, only one node and value can be passed to cucumber step.
      nodeNamesArray = [nodes];
      valuesArray = [values];
    } else {
      nodeNamesArray = nodes.split(delimiter);
      valuesArray = values.split(delimiter);
    }
    ``;
    let tempJson = convertToJSON(expResponse.value);
    nodeNamesArray.forEach(function (nodeName, index) {
      tempJson[nodeName] = evaluateValue(replaceVar(valuesArray[index]));
    });
    expResponse.value = tempJson;
  } else {
    assert.fail(
      'No exp response JSON loaded yet.\nPlease use exp response step to load a json.'
    );
  }
};

// -----------------AUTH0 TOKEN RELATED STUFF HERE---------------------------
module.exports.setValidAuth0Token = async () => {
  let auth0Headers = JSON.parse(JSON.stringify(config['auth0']['headers']));
  let auth0Body = JSON.parse(JSON.stringify(config['auth0']['body']));
  let auth0Url = JSON.parse(JSON.stringify(config['auth0']['url']));
  //console.log(`auth0Headers: ${JSON.stringify(auth0Headers)}; auth0Body:${JSON.stringify(auth0Body)}; auth0Url: ${JSON.stringify(auth0Url)}  `);

  const evalParams = ['username', 'password', 'client_id', 'client_secret'];
  for (const param of evalParams) {
    auth0Body[param] = eval(auth0Body[param]);
  }

  const axiosConfig = {
    method: 'post',
    url: auth0Url,
    headers: auth0Headers,
    data: qs.stringify(auth0Body),
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(3900);
  await axios(axiosConfig)
    .then(function (response) {
      auth0Token.value = response.data.access_token;
    })
    .catch(function (error) {
      console.warn(`Error generating token - error: ${error}`);
    });
};

module.exports.setInvalidAuth0Token = () => {
  auth0Token.value = '';
};

module.exports.updateExpectedFrequency = (filePath) => {
  let newResponse = res.value.res.body[0];
  console.log(res.value.res.body);
  console.log(newResponse);
  newResponse.frequency = newResponse.frequency + 1;
  // newResponse.date = getDate_(new Date(),true)
  let data = JSON.stringify(newResponse);
  fs.writeFileSync(
    `${__dirname}/../../../data/request${filePath}`,
    data,
    (error) => {
      console.log(error);
    }
  );
};
