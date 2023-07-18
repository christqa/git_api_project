// ____________________GLOBAL_______________________________
//---------------------LIBRARIES------------------------------
const pactum = require('pactum');
const { assert } = require('chai');

//--------------------Global Constants----------------------------
module.exports.config = require('../../config.json'); // Config JSON for api calls.
module.exports.delimiter = ';'; // Separator for more than one data entries in cucumber scenarios.
module.exports.selectedEnv = process.env.API_TEST_ENV;
module.exports.baseUrl =
  module.exports.config['baseUrl'][module.exports.selectedEnv];
module.exports.responseDir = 'data/response';
module.exports.schemaDir = 'data/schema';
module.exports.requestDir = 'data/request';

module.exports.e2e = pactum.e2e('End to end instance');
module.exports.method = { value: null };
module.exports.headers = { value: null };
module.exports.auth0Token = { value: null };
module.exports.lastRequest = { value: null };
module.exports.resource = { value: null }; // API resource that can be used to call a specific endpoint.
module.exports.url = { value: null }; // Endpoint url for the service call.
module.exports.res = { value: null }; // Stores the most rescent response from the last service call.
module.exports.request = { value: null }; // Payload or parameters to be sent for the service call.
module.exports.variable = {}; // Variable to assign values
module.exports.expResponse = { value: null }; // Variable to store expected response to later compare against actual response.

//--------------------Global Functions-----------------------------

module.exports.getNodeName = (node) => {
  const nodeName = node.trim();
  const regex1 = /^body/;
  const regex2 = /^\[.*\]\./;
  return (
    'res.res.' +
    (nodeName.match(regex1) !== null
      ? nodeName
      : nodeName.match(regex2) !== null
      ? `body${nodeName}`
      : `body.${nodeName}`)
  );
};

module.exports.convertToJSON = (stringVal) => {
  try {
    return JSON.parse(module.exports.replaceVar(stringVal));
  } catch (jsonError) {
    assert.fail(`\nInvalid JSON format.\n${stringVal}\n${jsonError}`);
  }
};

module.exports.getValue = (varName) => {
  return module.exports.variable[varName];
};

module.exports.replaceVar = (varString) => {
  let newvarString = varString;
  if (module.exports.variable !== null && module.exports.variable !== {}) {
    Object.keys(module.exports.variable).forEach(function (key) {
      var value = module.exports.variable[key];
      newvarString = newvarString.replace(key, value);
    });
  }
  return newvarString;
};

module.exports.getDate_ = (date, withoutHMSFormat = false) => {
  if (!withoutHMSFormat) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    let hours = date.getUTCHours().toString();
    hours = hours.length > 1 ? hours : '0' + hours;
    let minutes = date.getUTCMinutes().toString();
    minutes = minutes.length > 1 ? minutes : '0' + minutes;
    let seconds = date.getUTCSeconds().toString();
    seconds = seconds.length > 1 ? seconds : '0' + seconds;
    let firstPart = year + '-' + month + '-' + day;
    let secondPart = 'T' + hours + ':' + minutes + ':' + seconds + 'Z';
    return firstPart + secondPart;
  } else {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString();
    month = month.length > 1 ? month : '0' + month;
    let day = date.getDate().toString();
    day = day.length > 1 ? day : '0' + day;
    return year + '-' + month + '-' + day;
  }
};

module.exports.getFormattedDate = (date) => {
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  let day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  return month + '/' + day + '/' + year;
};

module.exports.calculateEighteenYearsOfAge = () => {
  let date_now = new Date(Date.now());
  let year = date_now.getUTCFullYear();
  let month = date_now.getMonth();
  let day = date_now.getDate();
  let eighteen_yearsAgo = year - 18;
  date_now = new Date(`${month}/${day}/${eighteen_yearsAgo}`);
  return module.exports.getFormattedDate(date_now);
};
