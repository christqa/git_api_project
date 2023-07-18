import {
  Body,
  Controller,
  Middlewares,
  NoSecurity,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { deviceEventsService } from '@modules/index/index.service';
import { ISaveEventRequestDto } from './dtos/device-events-save-event.dto';
import { DefaultSecurityMethods } from '../../constants';
import deviceEventsInternalValidation from './device-events.internal.validation';

@Route('/internal/device-events')
@Tags('device-events')
@Security(DefaultSecurityMethods)
export class DeviceEventsInternalController extends Controller {
  /**
   * Used by the event service to save an event
   */
  @Post('save-event')
  @NoSecurity()
  @SuccessResponse(201, 'success')
  @Middlewares(deviceEventsInternalValidation.validateSaveEventInternal)
  async saveEvent(@Body() saveEventRequestDto: ISaveEventRequestDto) {
    await deviceEventsService.saveEvent(saveEventRequestDto);
  }
}
