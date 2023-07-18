import { IStartBathroomActivityRequestDto } from '@modules/bathroom-activity/dto/start-bathroom-activity-request.dto';
import bathroomActivitysRepository from '@repositories/bathroom-activity.repository';
import deviceInventoryRepository from '@repositories/device-inventory.repository';
import { checkIfDeviceIsActivated } from '@modules/device-activation/device-activation.service';
import { noDevice } from '@modules/device-inventory/device-inventory.error';
import { noActivatedDevice } from '@modules/device-activation/device-activation.error';
import { findProfileById } from '@modules/profile/profile.service';
import { ISaveBathroomActivityImagesRequestDto } from './dto/save-bathroom-activity-images-request.dto';
import {
  createBathroomActivityError,
  deviceIdNotMatchBathroomActivity,
  noBathroomActivity,
  profileIdNotMatchWithDeviceSerial,
} from './bathroom-activity.error';
import { IPatchBathroomActivityRequestDto } from '@modules/bathroom-activity/dto/patch-bathroom-activity-request.dto';
import {
  IBathroomActivityFile,
  IBathroomActivitysUpdateType,
} from './bathroom-activity.type';
import { IGetBathroomActivityResponseDto } from './dto/get-unprocessed-event-response.dto';
import { IGetBathroomActivitySummaryResponseDto } from './dto/get-bathroom-activity-summary-response.dto';
import moment from 'moment';
import { IBathroomActivityRequestDTO } from './dto/create-bathroom-activity-request.dto';
import { v4 as uuidv4 } from 'uuid';
import { IBathroomActivityResponseDTO } from './dto/create-bathroom-activity-response.dto';

const start = async (eventStartRequest: IStartBathroomActivityRequestDto) => {
  const {
    deviceSerial,
    profileId,
    eventBody,
    startedOn,
    bathroomActivityUuid,
  } = eventStartRequest;
  // validate user profile
  await findProfileById(profileId);

  // validate device by serial N
  const device = await getActivatedDeviceBySerial(deviceSerial);

  // check if bathroom activity exists
  const bathroomActivity =
    await bathroomActivitysRepository.findBathroomActivity({
      eventUuid: bathroomActivityUuid,
    });

  // create new bathroom activity
  if (!bathroomActivity) {
    return bathroomActivitysRepository.createBathroomActivity({
      profileId,
      deviceId: device.id,
      eventBody,
      startedOn,
      eventUuid: bathroomActivityUuid,
    });
  }

  // check device from payload against saved one
  if (bathroomActivity.deviceId !== device.id) {
    throw deviceIdNotMatchBathroomActivity();
  }

  // update existing bathroom activity
  return bathroomActivitysRepository.updateBathroomActivity(
    bathroomActivityUuid,
    {
      profileId,
      eventBody,
      startedOn,
    }
  );
};

const saveImages = async (
  saveImagesRequest: ISaveBathroomActivityImagesRequestDto
) => {
  const { deviceSerial, bathroomActivityUuid, images } = saveImagesRequest;

  // validate device by serial N
  const device = await getActivatedDeviceBySerial(deviceSerial);

  // validate unprocessed event
  const bathroomActivity =
    await bathroomActivitysRepository.findBathroomActivity({
      deviceId: device.id,
      eventUuid: bathroomActivityUuid,
    });
  if (!bathroomActivity) {
    throw noBathroomActivity();
  }

  // save image(s); as of this time, only an array of one (1) element is sent
  // so the filename will be also one (1)
  const data = images.map((image) => ({
    bathroomActivityId: bathroomActivity.id,
    fileMetadata: image.imageMetadata,
    filename: saveImagesRequest.filename,
    createdOn: image.imageMetadata?.captureTimestamp || undefined,
  }));
  return bathroomActivitysRepository.createBathroomActivityImages(data);
};

const patchEvent = async (
  eventUuid: string,
  requestBody: IPatchBathroomActivityRequestDto
) => {
  let device;
  // validate unprocessed event
  const bathroomActivity =
    await bathroomActivitysRepository.findBathroomActivity({
      eventUuid,
    });
  if (!bathroomActivity) {
    throw noBathroomActivity();
  }
  if (requestBody.deviceSerial) {
    // validate if the device is still active
    device = await getActivatedDeviceBySerial(requestBody.deviceSerial);
  }
  delete requestBody.deviceSerial;

  //get the startedOn for this event (we don't have it from the payload anymore)
  // according to https://projectspectra.atlassian.net/wiki/spaces/firmware/pages/74743843/In+Progress+AWS+IoT+Topic+Design+Payload+Structure

  requestBody.startedOn = bathroomActivity.startedOn
    ? moment(bathroomActivity.startedOn).toDate()
    : moment.utc().toDate();

  const { bathroomActivityUuid, ...requestBodyParams } = requestBody;
  const requestBodyForPrisma: IBathroomActivitysUpdateType = {
    eventUuid: bathroomActivityUuid,
    ...requestBodyParams,
  };

  return bathroomActivitysRepository.updateBathroomActivity(eventUuid, {
    ...requestBodyForPrisma,
    deviceId: device?.id,
  });
};

const getEvent = async (
  eventUuid: string
): Promise<IGetBathroomActivityResponseDto> => {
  const bathroomActivity =
    await bathroomActivitysRepository.findBathroomActivityWithBathroomActivityFiles(
      eventUuid
    );
  if (!bathroomActivity) {
    throw noBathroomActivity();
  }
  const bathroomActivityFiles = bathroomActivity.BathroomActivityFiles;
  let jsonField = bathroomActivity.fileLocationMetadata;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jsonParsed: any = {};
  if (typeof jsonField === 'string') {
    jsonField = jsonField.toString();
    jsonParsed = JSON.parse(jsonField);
  } else if (typeof jsonField === 'object') {
    jsonField = jsonField as object;
    jsonParsed = jsonField;
  }
  if (!jsonParsed) {
    jsonParsed = {
      region: '',
      bucket: '',
    };
  }
  console.log('JSONFIELD ', JSON.stringify(jsonField));

  const files: IBathroomActivityFile[] = [];
  bathroomActivityFiles.forEach((bathroomActivityFile: any) => {
    files.push({
      keyPrefix: `${bathroomActivity.deviceInventory.deviceSerial}/${bathroomActivity.eventUuid}`,
      region: jsonParsed.region,
      filename: bathroomActivityFile.filename,
      bucket: jsonParsed.bucket,
      fileMetadata: bathroomActivityFile.fileMetadata,
      isProcessed: bathroomActivityFile.isFileProcessed,
      processedAt: bathroomActivityFile.processedOn,
    });
  });
  return {
    eventUuid: bathroomActivity.eventUuid,
    profileId: bathroomActivity.profileId,
    deviceId: bathroomActivity.deviceId,
    startTimestamp: bathroomActivity.startedOn?.toISOString(),
    endTimestamp: bathroomActivity.endedOn?.toISOString(),
    files,
    isProcessed: bathroomActivity.isEventProcessed,
  };
};

// \"974/c6fcb746-3c55-4d9b-bbb3-d8eb13549b5c/2023-06-16T08:27:21.455Z\",
const getBathroomActivitySummary = async (
  eventUuid: string
): Promise<IGetBathroomActivitySummaryResponseDto> => {
  const bathroomActivity =
    await bathroomActivitysRepository.findBathroomActivityWithBathroomActivityFiles(
      eventUuid
    );
  if (!bathroomActivity) {
    throw noBathroomActivity();
  }

  let jsonField = bathroomActivity.fileLocationMetadata;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let jsonParsed: any = {};
  if (typeof jsonField === 'string') {
    jsonField = jsonField.toString();
    jsonParsed = JSON.parse(jsonField);
  } else if (typeof jsonField === 'object') {
    jsonField = jsonField as object;
    jsonParsed = jsonField;
  }

  if (!jsonParsed) {
    jsonParsed = {
      region: '',
      bucket: '',
    };
  }
  console.log('JSONFIELD2 ', JSON.stringify(jsonField));

  const bathroomActivityFiles = bathroomActivity.BathroomActivityFiles;
  const images: IBathroomActivityFile[] = [];
  bathroomActivityFiles.forEach((bathroomActivityFile: any) => {
    images.push({
      keyPrefix: `${bathroomActivity.deviceInventory.deviceSerial}/${bathroomActivity.eventUuid}`,
      region: jsonParsed.region,
      filename: bathroomActivityFile.filename,
      bucket: jsonParsed.bucket,
      fileMetadata: bathroomActivityFile.fileMetadata,
      isProcessed: bathroomActivityFile.isFileProcessed,
      processedAt: bathroomActivityFile.processedOn,
    });
  });
  const durationInSeconds = moment(bathroomActivity.endedOn).diff(
    moment(bathroomActivity.startedOn),
    'seconds'
  );
  return {
    startDate: bathroomActivity.startedOn,
    endDate: bathroomActivity.endedOn,
    bathroomActivityUuid: bathroomActivity.eventUuid,
    durationInSeconds: durationInSeconds,
    profileId: bathroomActivity.profileId,
    deviceSerial: bathroomActivity.deviceInventory.deviceSerial,
    images,
  };
};

const createBathroomActivity = async (
  bathroomActivityRequestDTO: IBathroomActivityRequestDTO
): Promise<IBathroomActivityResponseDTO> => {
  const { profileId, deviceSerial } = bathroomActivityRequestDTO;
  const bathroomActivityUuid = uuidv4();

  const profile = await findProfileById(profileId);
  const device = await getActivatedDeviceBySerial(deviceSerial, profile.userId);
  const bathroomActivity =
    await bathroomActivitysRepository.createBathroomActivity({
      profileId,
      deviceId: device.id,
      eventUuid: bathroomActivityUuid,
    });
  if (!bathroomActivity) {
    throw createBathroomActivityError();
  }
  return { bathroomActivityUuid };
};

export default {
  start,
  saveImages,
  patchEvent,
  getEvent,
  getBathroomActivitySummary,
  createBathroomActivity,
};

const getActivatedDeviceBySerial = async (
  deviceSerial: string,
  userId?: number
) => {
  const device = await deviceInventoryRepository.findFirst({
    deviceSerial,
  });
  if (!device) {
    throw noDevice();
  }
  const activatedDevice = await checkIfDeviceIsActivated(device.id);
  if (activatedDevice.deactivatedBy || activatedDevice.deleted) {
    throw noActivatedDevice();
  }
  if (userId && userId !== activatedDevice.activatedBy) {
    throw profileIdNotMatchWithDeviceSerial();
  }
  return device;
};
