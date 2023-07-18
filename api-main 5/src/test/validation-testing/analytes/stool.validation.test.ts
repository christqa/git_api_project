import {
  deleteStool,
  getStoolData,
  upsertStool,
} from '@modules/analytes/analytes.validation';

import {
  testSuiteForValidators,
  BodyValidatorContainer,
  QueryValidatorContainer,
  ParamsValidatorContainer,
} from '../../common.validation';

import deleteStoolTestCases from './test-data/stool/delete-stool-test-cases.json';
import getStoolDataTestCases from './test-data/stool/get-stool-data-test-cases.json';
import upsertStoolTestCases from './test-data/stool/upsert-stool-test-cases.json';

// Test the deleteStool validators
let testSuiteName = 'Delete Stool Object Schema';
const deleteStoolValidatorContainers = [
  new BodyValidatorContainer(deleteStool.body),
];
testSuiteForValidators(
  testSuiteName,
  deleteStoolTestCases,
  deleteStoolValidatorContainers
);

// Test the getStoolData validators
testSuiteName = 'Delete GetStoolData Object Schema';
const getStoolDataValidatorContainers = [
  new QueryValidatorContainer(getStoolData.query),
];
testSuiteForValidators(
  testSuiteName,
  getStoolDataTestCases,
  getStoolDataValidatorContainers
);

// Test suite for upsertStool validations
testSuiteName = 'Delete upsertStool Object Schemas';
const upsertStoolValidatorContainers = [
  new BodyValidatorContainer(upsertStool.body),
  new QueryValidatorContainer(upsertStool.query),
  new ParamsValidatorContainer(upsertStool.params),
];
testSuiteForValidators(
  testSuiteName,
  upsertStoolTestCases,
  upsertStoolValidatorContainers
);
