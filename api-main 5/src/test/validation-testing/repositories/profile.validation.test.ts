import { updateProfile } from '@modules/profile/profile.validation';

import {
  testSuiteForValidators,
  BodyValidatorContainer,
} from '../../common.validation';

import updateProfileTestCases from './test-data/profile/update-profile-test-cases.json';

// Test the updateUser validators
const testSuiteName = 'updateProfile Schema';
const updateUserValidatorContainers = [
  new BodyValidatorContainer(updateProfile),
];
testSuiteForValidators(
  testSuiteName,
  updateProfileTestCases,
  updateUserValidatorContainers
);
