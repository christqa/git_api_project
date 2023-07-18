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
import { DefaultSecurityMethods } from '../../constants';
import { ICreateAgreementRequestDto } from './dtos/create-agreements.dto';
import agreementsValidations from './ageements.internal.validation';
import agreementsService from './agreements.service';

@Tags('agreementsReferenceData')
@Route('internal/agreements')
@Security(DefaultSecurityMethods)
export class AgreementsInternalController extends Controller {
  /**
   * Called by app-events-new-agreement
   */
  @Post()
  @NoSecurity()
  @Middlewares(agreementsValidations.validateCreateAgreement)
  @SuccessResponse(204, 'No Content')
  public async createAgreements(
    @Body() createAgreementDto: ICreateAgreementRequestDto
  ) {
    await agreementsService.createAgreements(createAgreementDto);
  }
}
