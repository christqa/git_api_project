import { referenceDataVersionNotFound } from './reference-data.error';
import * as referenceDataJSON from './reference-data.json';
import { IGetReferenceDataResponseDto } from './dtos/reference-data.index.dto';
import referenceDataRepository from '@repositories/reference-data.repository';
import agreeementsRepository from '@repositories/agreements.repository';
import { agreementTypes } from '@modules/agreements/agreements.type';
import dataPrivacyRemovalRequestsRepository from '@repositories/data-privacy-removal-requests.repository';
import config from '@core/enviroment-variable-config';

const find = async (
  includeTimezones?: boolean
): Promise<IGetReferenceDataResponseDto> => {
  const referenceDataVersion =
    await referenceDataRepository.findReferenceDataVersion();
  if (!referenceDataVersion || !referenceDataVersion.version) {
    throw referenceDataVersionNotFound();
  }

  const gender = await referenceDataRepository.findGender();
  const lifeStyle = await referenceDataRepository.findLifeStyle();
  const exerciseIntensity =
    await referenceDataRepository.findExerciseIntensity();
  const medicalCondition = await referenceDataRepository.findMedicalCondition();
  const medication = await referenceDataRepository.findMedication();
  const urinationsPerDay = await referenceDataRepository.findUrinationsPerDay();
  const bowelMovement = await referenceDataRepository.findBowelMovement();
  const messageTypes = await referenceDataRepository.findMessageTypes();
  const dataPrivacyRemovalRequestTypes =
    await dataPrivacyRemovalRequestsRepository.findRequestTypes();
  const dataPrivacyRemovalRequestReasons =
    await dataPrivacyRemovalRequestsRepository.findRequestReasons();
  // Disabled temporary in the scope of SW-3075
  // const regionalPref = await referenceDataRepository.findRegionalPref();

  // eslint-disable-next-line
  const staticData = referenceDataJSON.data as any;
  const data = await agreeementsRepository.findAll();
  const reprocessedData = (function () {
    // eslint-disable-next-line
    const ret: any = {};
    ret['en'] = {
      [agreementTypes.privacyPolicy]: { type: 'versioned', values: [] },
      [agreementTypes.termsAndConditions]: { type: 'versioned', values: [] },
    };
    ret['zh'] = {
      [agreementTypes.privacyPolicy]: { type: 'versioned', values: [] },
      [agreementTypes.termsAndConditions]: { type: 'versioned', values: [] },
    };
    for (const subData of data) {
      ret[subData.localeIso][subData.agreementType]['values'].push({
        version: subData.version,
        value: subData.url,
      });
    }

    return ret;
  })();
  const returnedObj = {
    version: referenceDataVersion.version,
    data: {
      en: {
        messageTypes: {
          type: 'enum',
          values: messageTypes,
        },
        gender: {
          type: 'enum',
          values: gender,
        },
        lifeStyle: {
          type: 'enum',
          values: lifeStyle,
        },
        exerciseIntensity: {
          type: 'enum',
          values: exerciseIntensity,
        },
        medicalCondition: {
          type: 'enum',
          values: medicalCondition,
        },
        medications: {
          type: 'enum',
          values: medication,
        },
        urinationsPerDay: {
          type: 'enum',
          values: urinationsPerDay,
        },
        bowelMovement: {
          type: 'enum',
          values: bowelMovement,
        },
        dataPrivacyRemovalRequestTypes: {
          type: 'enum',
          values: dataPrivacyRemovalRequestTypes,
        },
        dataPrivacyRemovalRequestReasons: {
          type: 'enum',
          values: dataPrivacyRemovalRequestReasons,
        },
        /** Disabled temporary in the scope of SW-3075 **
        regionalPref: {
          type: 'enum',
          values: regionalPref,
        },
        */
        faqManifestUrl: {
          type: 'static',
          values: { url: `${config.staticAssetsBaseUrl}/faq/en/manifest.json` },
        },
        privacyPolicyUrl: reprocessedData.en.privacyPolicy,
        termsAndConditionsUrl: reprocessedData.en.termsAndConditions,
      },
      zh: {
        messageTypes: {
          type: 'enum',
          values: messageTypes,
        },
        dataPrivacyRemovalRequestTypes: {
          type: 'enum',
          values: dataPrivacyRemovalRequestTypes,
        },
        dataPrivacyRemovalRequestReasons: {
          type: 'enum',
          values: dataPrivacyRemovalRequestReasons,
        },
        faqManifestUrl: {
          type: 'static',
          values: { url: `${config.staticAssetsBaseUrl}/faq/zh/manifest.json` },
        },
        privacyPolicyUrl: reprocessedData.zh.privacyPolicy,
        termsAndConditionsUrl: reprocessedData.zh.termsAndConditions,
        ...staticData.zh,
      },
    },
  } as IGetReferenceDataResponseDto;
  if (includeTimezones) {
    const timeZone = await referenceDataRepository.findTimeZone();
    returnedObj.data.en.timeZone = {
      type: 'enum',
      values: timeZone,
    };
    returnedObj.data.zh.timeZone = {
      type: 'enum',
      values: timeZone,
    };
  }
  return returnedObj;
};

export { find };
