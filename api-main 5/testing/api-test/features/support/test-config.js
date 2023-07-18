let {
  e2e,
  resource,
  url,
  method,
  headers,
  lastRequest,
  res,
  request,
  expResponse,
  variable,
} = require('./common.js');

let { isJSON } = require('./utility');

const { setThisHeaders } = require('./core-functions/core-functions.js');
const { BeforeAll, Before, After, AfterAll } = require('@cucumber/cucumber');

// _____________________CUCUMBER HOOKS________________________________

/**
 * @description Anything inside BeforeAll block is excuted before any test has started.
 * A perect place to execute all the test suite setup activities.
 * Multiple BeforeAll blocks can be defined and all will be executed at test suite setup.
 */
BeforeAll(async () => {
  // BeforeAll is not needed at the time.
});

/**
 * @description Anything inside Before block is excuted before each test has started.
 * A perect place to execute all the test setup activities.
 * Multiple Before blocks can be defined and all will be executed at setup.
 */
Before(async (scenario) => {
  console.log(`Scenario Name: ${scenario.pickle.name}`);
  // await setValidAuth0Token(); // Valid Auth0 Bearer Token to make successful API calls.
  headers.value = null;
  setThisHeaders();

  //--------------------Test Class Variables----------------------------
  lastRequest.value = null; // Saves last request sent
  method.value = null;
});

/**
 * @description Anything inside After block is excuted after each test is done.
 * A perect place to execute all the test teardown activities.
 * Multiple After blocks can be defined and all will be executed at teardown.
 */
After(async (scenario) => {
  console.log(scenario.result.status);
  if (scenario.result.status === 'FAILED') {
    console.log(`\nENDPOINT:  \n${JSON.stringify(url)}`);
    console.log(`\nMETHOD:  \n${method.value}`);
    console.log(
      `\nREQUEST SENT:  \n${
        isJSON(lastRequest.value) === true
          ? JSON.stringify(lastRequest.value)
          : lastRequest.value
      }`
    );
    console.log(
      `\nRESPONSE RECIEVED:  \n${
        isJSON(res.value.res.body) === true
          ? JSON.stringify(res.value.res.body)
          : res.value.res.body
      }`
    );
  }
  await e2e.cleanup();
  res.value = null;
  request.value = null;
  url.value = null;
  resource.value = null;

  for (let key in Object.keys(variable)) {
    delete variable[key];
  }

  expResponse.value = null;
  lastRequest.value = null;
  method.value = null;
});

/**
 * @description Anything inside AfterAll block is excuted after all tests are done.
 * A perect place to execute all the test teardown setup activities.
 * Multiple AfterAll blocks can be defined and all will be executed at test suite teardown.
 */
AfterAll(() => {
  //  console.log("\nNo Test Teardown Setup defined.");
});
// _____________________CUCUMBER HOOKS END____________________________
