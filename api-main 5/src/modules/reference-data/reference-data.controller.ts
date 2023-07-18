import { referenceDataService } from '@modules/index/index.service';
import { IGetReferenceDataResponseDto } from './dtos/reference-data.index.dto';
import {
  Controller,
  Get,
  NoSecurity,
  Query,
  Route,
  Security,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';

@Route('/reference-data')
@Tags('reference-data')
@Security(DefaultSecurityMethods)
export class ReferenceDataController extends Controller {
  /**
   *  Used by the app
   */
  @Get()
  @NoSecurity()
  async getReferenceData(
    @Query() timezones?: boolean
  ): Promise<IGetReferenceDataResponseDto> {
    return referenceDataService.find(timezones);
  }
}
