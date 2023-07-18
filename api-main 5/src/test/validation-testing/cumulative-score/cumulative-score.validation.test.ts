import {
  createCumulativeScore,
  deleteCumulativeScore,
  getCumulativeScore,
} from '@modules/cumulative-score/cumulative-score.validation';

import {
  testSuiteForValidators,
  BodyValidatorContainer,
  QueryValidatorContainer,
} from '../../common.validation';

import createCumulativeScoreTestCases from './test-data/create-cumulative-score-test-cases.json';
import deleteCumulativeScoreTestCases from './test-data/delete-cumulative-score-test-cases.json';
import getCumulativeScoreValidTestCases from './test-data/get-cumulative-score-test-cases.json';

// Test the createCumulativeScore validators
let testSuiteName = 'createCumulativeScore Schema';
const createCumulativeScoreValidatorContainers = [
  new BodyValidatorContainer(createCumulativeScore.body),
];
testSuiteForValidators(
  testSuiteName,
  createCumulativeScoreTestCases,
  createCumulativeScoreValidatorContainers
);

// Test the deleteCumulativeScore validators
testSuiteName = 'deleteCumulativeScore Schema';
const deleteCumulativeScoreValidatorContainers = [
  new BodyValidatorContainer(deleteCumulativeScore.body),
];
testSuiteForValidators(
  testSuiteName,
  deleteCumulativeScoreTestCases,
  deleteCumulativeScoreValidatorContainers
);

// Test the getCumulativeScore validators
testSuiteName = 'getCumulativeScore Schema';
const getCumulativeScoreValidatorContainers = [
  new QueryValidatorContainer(getCumulativeScore.query),
];
testSuiteForValidators(
  testSuiteName,
  getCumulativeScoreValidTestCases,
  getCumulativeScoreValidatorContainers
);
