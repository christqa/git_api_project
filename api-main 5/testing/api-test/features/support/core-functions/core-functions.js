let { e2e, url, headers, res, request } = require('../common.js');

const verifications = require('./verifications.js');
const setters = require('./setters.js');
const { assert } = require('chai');
module.exports = { ...verifications, ...setters };

// ---------------------------------Direct functions to mapped cucumber Steps------------

/**
 * @param {string} method Name of the method that you want to call. It can take get, post, put, delete, etc.
 * @description Makes a async request to the API service. This results in getting a response from the API service. Must call step resource "/resource" first.
 * @example When method "get"   // Makes a get call to the endpoint set by resource "/resource" step.
 * @example When method "post"  // Makes a post call to the endpoint set by resource "/resource" step.
 * @example When method "put"   // Makes a put call to the endpoint set by resource "/resource" step.
 */
module.exports.makeRequest = async (method) => {
  const step = e2e.step('API service call');
  method.value = method;
  headers.value.accept = 'application/json';

  if (!url.value) {
    assert.fail('Url is null or undefined.');
  }

  url.value =
    request.value && request.value.path
      ? encodeURI(url.value) + request.value.path
      : url.value;

  const placeholderParams = { placeholder: '' };

  await step
    .spec()
    .withMethod(method)
    .withPath(url.value)
    .withHeaders(headers.value ? headers.value : {})
    .withQueryParams(
      request.value && request.value.parameters
        ? request.value.parameters
        : placeholderParams
    )
    .withBody(request.value && request.value.body ? request.value.body : {})
    .expect((ctx) => {
      res.value = ctx;
    });
};
