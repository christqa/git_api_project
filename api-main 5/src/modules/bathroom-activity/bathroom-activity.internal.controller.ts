import { Controller } from '@tsoa/runtime';
import {
  Body,
  Get,
  Middlewares,
  NoSecurity,
  Patch,
  Path,
  Post,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import bathroomActivityInternalValidations from './bathroom-activity.internal.validation';
import { IStartBathroomActivityRequestDto } from './dto/start-bathroom-activity-request.dto';
import { ISaveBathroomActivityImagesRequestDto } from './dto/save-bathroom-activity-images-request.dto';
import bathroomActivityService from './bathroom-activity.service';
import { IPatchBathroomActivityRequestDto } from './dto/patch-bathroom-activity-request.dto';

@Tags('bathroomActivity')
@Route('internal')
@Security(DefaultSecurityMethods)
export class BathroomActivityInternalController extends Controller {
  /**
   *
   * Called by the event consumer device event unprocessed event
   */
  @Post('/bathroom-activity')
  @NoSecurity()
  @SuccessResponse(204, 'No Content')
  @Middlewares(
    bathroomActivityInternalValidations.validateStartBathroomActivity
  )
  async getUserByProfileId(
    @Body() startBathroomActivityRequest: IStartBathroomActivityRequestDto
  ) {
    await bathroomActivityService.start(startBathroomActivityRequest);
  }

  /**
   *
   * Called by the event consumer device event unprocessed event images
   */
  @Post('/bathroom-activity/images')
  @NoSecurity()
  @SuccessResponse(204, 'No Content')
  @Middlewares(
    bathroomActivityInternalValidations.validateSaveBathroomActivityImages
  )
  async saveImages(
    @Body()
    saveBathroomActivityImagesRequest: ISaveBathroomActivityImagesRequestDto
  ) {
    await bathroomActivityService.saveImages(saveBathroomActivityImagesRequest);
  }

  /**
   *
   * Called by the event consumer device event unprocessed event end event
   */
  @Patch('/bathroom-activity/{eventUuid}')
  @NoSecurity()
  @SuccessResponse(204, 'No Content')
  @Middlewares(
    bathroomActivityInternalValidations.validatePatchBathroomActivityImages
  )
  async patchBathroomActivity(
    @Path() eventUuid: string,
    @Body() patchBathroomActivityRequest: IPatchBathroomActivityRequestDto
  ) {
    await bathroomActivityService.patchEvent(
      eventUuid,
      patchBathroomActivityRequest
    );
  }

  @Get('/bathroom-activity/{eventUuid}')
  @NoSecurity()
  @SuccessResponse(200, 'Ok')
  @Middlewares(bathroomActivityInternalValidations.validateGetBathroomActivity)
  async getBathroomActivity(@Path() eventUuid: string) {
    return await bathroomActivityService.getEvent(eventUuid);
  }

  @Get('/bathroom-activity/{eventUuid}/summary')
  @NoSecurity()
  @SuccessResponse(200, 'Ok')
  @Middlewares(bathroomActivityInternalValidations.validateGetBathroomActivity)
  async getBathroomActivitySummary(@Path() eventUuid: string) {
    return await bathroomActivityService.getBathroomActivitySummary(eventUuid);
  }
}
