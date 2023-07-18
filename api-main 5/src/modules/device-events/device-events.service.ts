import { IEvents, IEventsCreateInput } from './device-events.type';
import eventsRepository from '@repositories/events.repository';
import { ISaveEventRequestDto } from './dtos/device-events-save-event.dto';
import { deviceInventoryService } from '@modules/index/index.service';
import { EventSource } from '@prisma/client';

const saveEvent = async (
  saveEventRequestDto: ISaveEventRequestDto
): Promise<IEvents> => {
  const data = {
    eventData: saveEventRequestDto.eventData,
    eventSource: saveEventRequestDto.eventSource,
  } as IEventsCreateInput;

  // retrieve device from the inventory
  if (saveEventRequestDto.eventSource === EventSource.DeviceGenerated) {
    const device = await deviceInventoryService.getDevice(
      saveEventRequestDto.deviceSerial
    );
    data.deviceId = device.id;
  }

  return eventsRepository.create(data);
};

export { saveEvent };
