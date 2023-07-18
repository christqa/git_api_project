import {
  deleteUrine,
  getUrinations,
  upsertUrine,
} from '@modules/analytes/analytes.validation';

import {
  testSuiteForValidators,
  BodyValidatorContainer,
  QueryValidatorContainer,
  ParamsValidatorContainer,
} from '../../common.validation';

import deleteUrineTestCases from './test-data/urination/delete-urine-test-cases.json';
import getUrinationsTestCases from './test-data/urination/get-urinations-test-cases.json';
import upsertUrineTestCases from './test-data/urination/upsert-urine-test-cases.json';

// Test the deleteStool validators
let testSuiteName = 'deleteUrine Schema';
const deleteUrineValidatorContainers = [
  new BodyValidatorContainer(deleteUrine.body),
];
testSuiteForValidators(
  testSuiteName,
  deleteUrineTestCases,
  deleteUrineValidatorContainers
);

// Test the getUrinations validators
testSuiteName = 'getUrinations Schema';
const getUrinationsValidatorContainers = [
  new QueryValidatorContainer(getUrinations.query),
];
testSuiteForValidators(
  testSuiteName,
  getUrinationsTestCases,
  getUrinationsValidatorContainers
);

// Test the upsertUrine validators
testSuiteName = 'upsertUrine Schema';
const upsertUrineValidatorContainers = [
  new BodyValidatorContainer(upsertUrine.body),
  new ParamsValidatorContainer(upsertUrine.params),
  new QueryValidatorContainer(upsertUrine.query),
];

testSuiteForValidators(
  testSuiteName,
  upsertUrineTestCases,
  upsertUrineValidatorContainers
);
