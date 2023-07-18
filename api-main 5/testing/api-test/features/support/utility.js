const Ajv = require('ajv');
const { convert } = require('json-to-json-schema');
const fs = require('fs');
const path = require('path');
const { assert } = require('chai');
const expect = require('chai').expect;

module.exports.saveJsonFile = function saveJsonFile(filePath, jsonContent) {
  const content = JSON.stringify(jsonContent);
  fs.writeFileSync(filePath, content, (err) => {
    if (err) assert.fail(err);
  });
};

module.exports.loadFile = function (filePath, failTest = true) {
  try {
    let fullPath = filePath;
    if (!fs.existsSync(fullPath)) {
      fullPath = path.resolve(`${__dirname}../../${filePath}`);
    }

    let data = fs.readFileSync(fullPath, 'utf8');
    return data;
  } catch (err) {
    if (failTest === false) {
      return null;
    } else {
      assert.fail(err);
    }
  }
};

module.exports.createDir = function (dirPath) {
  var dir = path.resolve(`${__dirname}${dirPath}`);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

module.exports.evaluateValue = function (value) {
  let strValue = String(value);
  if (strValue.match(/Number\(.*\)|Array\(.*\)|Object\(.*\)/)) {
    return eval(value.trim());
  } else {
    return value;
  }
};

module.exports.isJSON = function (entity) {
  return typeof entity === 'object';
};

module.exports.getSnapshot = function (json, fileName, folder) {
  if (module.exports.isJSON(json)) {
    const dir = path.resolve(`${__dirname}/../../data/${folder}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const filePath = path.resolve(
      `${__dirname}/../../data/${folder}/${fileName}.json`
    );
    if (!fs.existsSync(filePath)) {
      module.exports.saveJsonFile(filePath, json);
    }
    // Convert string to JSON.
    return JSON.parse(module.exports.loadFile(filePath));
  } else {
    assert.fail('Response is not a JSON file.');
  }
};

module.exports.snapshotResponseSchema = function (responseJson, fileName) {
  const ajv = new Ajv();
  const jsonSchema = convert(responseJson);
  const expSchema = module.exports.getSnapshot(jsonSchema, fileName, 'schema');
  const valid = ajv.validate(expSchema, responseJson);
  if (!valid) {
    assert.fail(ajv.errors);
  }
};

module.exports.snapshotResponse = function (responseJson, fileName) {
  const expResponse = module.exports.getSnapshot(
    responseJson,
    fileName,
    'response'
  );
  expect(responseJson).to.be.deep.equal(expResponse);
};
// Create required folders before the execution of tests.
module.exports.createDir('../../../report');
module.exports.createDir('../../../data/request');
module.exports.createDir('../../../data/response');
module.exports.createDir('../../../data/schema');
