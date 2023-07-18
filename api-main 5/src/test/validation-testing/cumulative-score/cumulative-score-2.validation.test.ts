import {
  createCumulativeScore2,
  getCumulativeScore2,
} from '@modules/cumulative-score/cumulative-score.validation';

import {
  testSuiteForValidators,
  BodyValidatorContainer,
  QueryValidatorContainer,
  ParamsValidatorContainer,
} from '../../common.validation';

import createCumulativeScore2TestCases from './test-data/create-cumulative-score-2-test-cases.json';
import getCumulativeScore2TestCases from './test-data/get-cumulative-score-2-test-cases.json';

// Test the createCumulativeScore2 validators
let testSuiteName = 'createCumulativeScore2TestCases Schema';
const createCumulativeScore2ValidatorContainers = [
  new BodyValidatorContainer(createCumulativeScore2.body),
  new QueryValidatorContainer(createCumulativeScore2.query),
  new ParamsValidatorContainer(createCumulativeScore2.params),
];
testSuiteForValidators(
  testSuiteName,
  createCumulativeScore2TestCases,
  createCumulativeScore2ValidatorContainers
);

// Test the getCumulativeScore2 validators
testSuiteName = 'getCumulativeScore2 Schema';
const getCumulativeScore2ValidatorContainers = [
  new QueryValidatorContainer(getCumulativeScore2.query),
];
testSuiteForValidators(
  testSuiteName,
  getCumulativeScore2TestCases,
  getCumulativeScore2ValidatorContainers
);
