import { Schema, ValidationResult } from 'joi';

/**
 * This interface specifies the standard format of testcases
 */
interface TestCase {
  testName: string; // The name of the test case
  isPositiveTestCase: boolean; // A flag that indicates whether the test case should pass or fail
  responseKeywords?: Array<string>; // The expected reponse from the validators
  testCase: {
    body?: {};
    query?: {};
    params?: {};
    [key: string]: {} | undefined;
  };

  [key: string]: {} | string | Array<string> | boolean | undefined;
}

/**
 * This class is a generic container for schema validators
 */
abstract class ValidatorContainer {
  key: string;
  validator: Schema;

  /**
   * The ValidatorContainer constructor
   * @param key The schema validator key: the key that associates to the schema object
   * @param validator The schema validator
   */
  constructor(key: string, validator: Schema) {
    this.key = key;
    this.validator = validator;
  }
}

/**
 * This class acts as a container for body schema validators
 */
export class BodyValidatorContainer extends ValidatorContainer {
  /**
   * The BodyValidatorContainer constructor
   * @param validator
   */
  constructor(validator: Schema) {
    const schemaKey = 'body';
    super(schemaKey, validator);
  }
}

/**
 * This class acts as a container for query schema validators
 */
export class QueryValidatorContainer extends ValidatorContainer {
  /**
   * The QueryValidatorContainer constructor
   * @param validator
   */
  constructor(validator: Schema) {
    const schemaKey = 'query';
    super(schemaKey, validator);
  }
}

/**
 * This class acts as a container for params schema validators
 */
export class ParamsValidatorContainer extends ValidatorContainer {
  /**
   * The ParamsValidatorContainer constructor
   * @param validator
   */
  constructor(validator: Schema) {
    const schemaKey = 'params';
    super(schemaKey, validator);
  }
}

/**
 * Test a given validation schemes and its object schemas
 * @param testSuiteName the test suite name
 * @param testCases valid test cases
 * @param invalidTestCases invalid test cases
 * @param bodySchemaValidator the body schema validator
 * @param querySchemaValidator the query schema validator
 * @param paramsSchemaValidator the params schema validator
 */
export const testSuiteForValidators = (
  testSuiteName: string,
  testCases: Array<TestCase>,
  validatorContainers: Array<ValidatorContainer>
) => {
  describe(`Test Suite: ${testSuiteName}`, () => {
    for (const {
      testName,
      isPositiveTestCase,
      responseKeywords,
      testCase,
    } of testCases) {
      test(testName, () => {
        for (const { validator, key } of validatorContainers) {
          //When
          const validationResult = validator.validate(testCase[key]);

          //Then
          if (isPositiveTestCase) {
            handlePositiveTestCase(validationResult, testCase[key]);
          } else {
            handleNegativeTestCase(
              testSuiteName,
              testName,
              validationResult,
              responseKeywords
            );
          }
        }
      });
    }
  });
};

const handlePositiveTestCase = (
  validationResult: ValidationResult,
  // eslint-disable-next-line
  value: any
) => {
  expect(validationResult).toEqual({
    value,
    error: undefined,
  });
};

const handleNegativeTestCase = (
  testSuiteName: string,
  testName: string,
  validationResult: ValidationResult,
  responseKeywords: string[] | undefined
) => {
  expect(validationResult.error).not.toBeNull();
  expect(validationResult.error).not.toBeUndefined();

  // We will verify that the response key words are present.
  // If they are not present, we will add a note
  if (responseKeywords) {
    const actualErrorMessage = validationResult.error?.message;
    let isResponseKeywordPresent = false;
    if (actualErrorMessage) {
      isResponseKeywordPresent = responseKeywords?.includes(actualErrorMessage);
    }

    if (!isResponseKeywordPresent) {
      console.warn(`The test case, ${testName}, in test suite ${testSuiteName} failed as expected.
                                However, the the expected key words were not present.\n\n
                                Expected Responses: ${responseKeywords} \n Actual Response: ${validationResult.error?.message}  `);
    }
  }
};
