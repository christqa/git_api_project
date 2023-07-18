import { createSignedAgreements } from '@modules/signed-agreements/signed-agreements.validation';

import {
  testSuiteForValidators,
  BodyValidatorContainer,
} from '../../common.validation';

import createSignedAgreementsTestCases from './test-data/signed-agreements/create-signed-agreements-test-cases.json';

// Test the createSignedAgreements validators
const testSuiteName = 'createSignedAgreements Schema';
const createSignedAgreementsValidatorContainers = [
  new BodyValidatorContainer(createSignedAgreements.body),
];
testSuiteForValidators(
  testSuiteName,
  createSignedAgreementsTestCases,
  createSignedAgreementsValidatorContainers
);
