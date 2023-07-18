import {
  updateUserProfile,
  getUserConfiguration,
  updateUserConfiguration,
} from '@modules/user/user.validation';

import {
  testSuiteForValidators,
  BodyValidatorContainer,
  QueryValidatorContainer,
} from '../../common.validation';

import updateUserProfileValidTestCases from './test-data/user/update-user-profile-test-cases.json';
import updateUserConfigurationValidTestCases from './test-data/user/update-user-configuration-test-cases.json';
import getUserConfigurationValidTestCases from './test-data/user/get-user-configuration-test-cases.json';

// Test the updateUserProfile validators
let testSuiteName = 'updateUserProfile Schema';
const updateUserProfileValidatorContainers = [
  new BodyValidatorContainer(updateUserProfile.body),
];
testSuiteForValidators(
  testSuiteName,
  updateUserProfileValidTestCases,
  updateUserProfileValidatorContainers
);

// Test the updateUserConfiguration validators
testSuiteName = 'updateUserConfiguration Schema';
const updateUserConfigurationValidatorContainers = [
  new BodyValidatorContainer(updateUserConfiguration.body),
];
testSuiteForValidators(
  testSuiteName,
  updateUserConfigurationValidTestCases,
  updateUserConfigurationValidatorContainers
);

// Test the getUserConfiguration validators
testSuiteName = 'getUserConfiguration Schema';
const getUserConfigurationValidatorContainers = [
  new QueryValidatorContainer(getUserConfiguration.query),
];
testSuiteForValidators(
  testSuiteName,
  getUserConfigurationValidTestCases,
  getUserConfigurationValidatorContainers
);
