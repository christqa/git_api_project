import {
  Body,
  Controller,
  Middlewares,
  Post,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { IBathroomActivityRequestDTO } from './dto/create-bathroom-activity-request.dto';
import bathroomActivityService from './bathroom-activity.service';
import { DefaultSecurityMethods } from '../../constants';
import bathroomActivityInternalValidations from './bathroom-activity.internal.validation';
import { IBathroomActivityResponseDTO } from './dto/create-bathroom-activity-response.dto';
@Route('bathroom-activity')
@Tags('bathroomActivity')
@Security(DefaultSecurityMethods)
export class BathroomActivityController extends Controller {
  @Post()
  @Middlewares(bathroomActivityInternalValidations.validatePostBathroomActivity)
  createBathroomActivity(
    @Body() bathroomActivityRequestDTO: IBathroomActivityRequestDTO
  ): Promise<IBathroomActivityResponseDTO> {
    return bathroomActivityService.createBathroomActivity(
      bathroomActivityRequestDTO
    );
  }
}
