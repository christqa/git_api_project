import prisma from '@core/prisma/prisma';
import {
  IEvents,
  IEventsCreateInput,
  IEventWithDevice,
  IEventWithDeviceSortBy,
} from '@modules/device-events/device-events.type';
import { EventSource } from '@prisma/client';
import { camelToSnakeCase } from '@utils/string.util';

const { events } = prisma;

const create = async (data: IEventsCreateInput): Promise<IEvents> => {
  return events.create({
    data,
  });
};

const findAll = async (
  skip: number,
  take: number,
  sortBy?: string,
  orderBy?: string
): Promise<IEventWithDevice[]> => {
  let sortByField: string | undefined;
  if (sortBy) {
    switch (sortBy) {
      case IEventWithDeviceSortBy.eventId:
        sortByField = 'id';
        break;
      case IEventWithDeviceSortBy.deviceId:
        sortByField = 'device_serial';
        break;
      case IEventWithDeviceSortBy.deviceName:
        sortByField = 'device_name';
        break;
      case IEventWithDeviceSortBy.eventSource:
        sortByField = 'event_source';
        break;
      case IEventWithDeviceSortBy.generatedOn:
        sortByField = 'generated_on';
        break;
      default:
        break;
    }
  }

  const query = `
    SELECT
      "Events".id,
      "Events".device_id,
      "Events".event_data,
      "Events".event_source,
      "Events".generated_on,
      "DeviceInventory".id AS "device_inventory_id",
      "DeviceInventory".device_serial,
      "DeviceInventory".manufacturing_date,
      "DeviceInventory".id AS "device_inventory_device_model_id",
      "DeviceInventory".manufactured_for_region,
      "DeviceInventory".ble_mac_address,
      "DeviceInventory".wifi_mac_address,
      "DeviceInventory".device_metadata,
      "DeviceInventory".calibration_file_locations,
      "DeviceInventory".device_status AS "device_inventory_device_status",
      "DeviceActivation".id AS "DeviceActivation_id",
      "DeviceActivation".device_id AS "device_activation_device_id",
      "DeviceActivation".device_firmware_id,
      "DeviceActivation".time_zone_id,
      "DeviceActivation".device_name,
      "DeviceActivation".device_model_id,
      "DeviceActivation".device_status,
      "DeviceActivation".battery_status,
      "DeviceActivation".wifi_ssid,
      "DeviceActivation".rssi,
      "DeviceActivation".device_status_updated_on,
      "DeviceActivation".activated_on,
      "DeviceActivation".activated_by,
      "DeviceActivation".deactivated_by,
      "DeviceActivation".deleted,
      "DeviceActivation".is_notified
    FROM "Events"
      LEFT JOIN "DeviceInventory"
          LEFT JOIN "DeviceActivation" ON "DeviceActivation".device_id = "DeviceInventory".id AND "DeviceActivation".deleted IS NULL
        ON "DeviceInventory".id = "Events".device_id
    ${sortByField ? `ORDER BY ${sortByField} ${orderBy}` : ''}
    OFFSET ${skip} LIMIT ${take};
  `;

  const result = (await prisma.$queryRawUnsafe(query)) as any[];
  // map e.g. device_generated => DeviceGenerated
  const eventSourceMap: { [key: string]: string } = {};
  Object.keys(EventSource).forEach((key) => {
    eventSourceMap[
      camelToSnakeCase(key.charAt(0).toLowerCase() + key.slice(1))
    ] = EventSource[key as keyof typeof EventSource];
  });

  return result.map((item) => ({
    id: item.id,
    deviceId: item.deviceId,
    eventData: item.eventData,
    eventSource: eventSourceMap[item.eventSource] as EventSource,
    generatedOn: item.generatedOn,
    deviceInventory: item.deviceActivationId
      ? {
          id: item.deviceInventoryId,
          deviceSerial: item.deviceSerial,
          manufacturingDate: item.manufacturingDate,
          manufacturedForRegion: item.manufacturedForRegion,
          deviceModelId: item.deviceInventoryDeviceModelId,
          bleMacAddress: item.bleMacAddress,
          wiFiMacAddress: item.wifiMacAddress,
          deviceMetadata: item.deviceMetadata,
          calibrationFileLocations: item.calibrationFileLocations,
          deviceStatus: item.deviceInventoryDeviceStatus,
          deviceActivation: [
            {
              id: item.deviceActivationId,
              deviceId: item.deviceId,
              deviceFirmwareId: item.deviceFirmwareId,
              timeZoneId: item.timeZoneId,
              deviceName: item.deviceName,
              deviceModelId: item.deviceModelId,
              deviceStatus: item.deviceStatus,
              batteryStatus: item.batteryStatus,
              wiFiSSID: item.wifiSsid,
              rssi: item.rssi,
              deviceStatusUpdatedOn: item.deviceStatusUpdatedOn,
              activatedOn: item.activatedOn,
              activatedBy: item.activatedBy,
              deactivatedBy: item.deactivatedBy,
              deleted: item.deleted,
              isNotified: item.isNotified,
            },
          ],
        }
      : null,
  }));
};

const count = (): Promise<number> => {
  return events.count();
};

const countEvensWithinTime = (
  start: Date,
  end: Date = new Date()
): Promise<number> => {
  return events.count({ where: { generatedOn: { gte: start, lt: end } } });
};

export default {
  create,
  findAll,
  count,
  countEvensWithinTime,
};
