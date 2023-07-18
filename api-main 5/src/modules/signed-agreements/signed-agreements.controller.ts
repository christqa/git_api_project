import { signedAgreementsService } from '@modules/index/index.service';
import { ICreateSignedAgreementsRequestDto } from './dtos/signed-agreements.index.dto';
import { Controller } from '@tsoa/runtime';
import {
  Body,
  Middlewares,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import express from 'express';
import signedAgreementsValidation from './signed-agreements.validation';
import { DefaultSecurityMethods } from '../../constants';

@Route()
@Security(DefaultSecurityMethods)
export class SignedAgreementsController extends Controller {
  /**
   * Signs the agreement
   */
  @Tags('users')
  @Post('/users/me/signed-agreements')
  @SuccessResponse(204, 'No Content')
  @Middlewares(signedAgreementsValidation.validateCreateSignedAgreements)
  async createSignedAgreements(
    @Request() request: express.Request,
    @Body() signedAgreementsRequestDto: ICreateSignedAgreementsRequestDto
  ): Promise<void> {
    await signedAgreementsService.createSignedAgreements(
      signedAgreementsRequestDto,
      request.user.userGuid
    );
  }
}
