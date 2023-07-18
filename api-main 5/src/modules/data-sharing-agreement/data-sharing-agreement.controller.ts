import express from 'express';
import httpStatus from 'http-status';
import {
  Controller,
  Middlewares,
  Patch,
  Path,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
  Tags,
} from 'tsoa';
import { DefaultSecurityMethod } from '../../constants';
import dataSharingAgreementValidation from './data-sharing-agreement.validation';
import * as dataSharingAgreementService from './data-sharing-agreement.service';

@Route('/data-sharing-agreements')
@Tags('dataSharingAgreements')
@Security(DefaultSecurityMethod, [])
export class DataSharingAgreementController extends Controller {
  /**
   * Used to rekove data sharing agreement
   */
  @Patch('/{agreementId}/revoke')
  @Middlewares(
    dataSharingAgreementValidation.validateRevokeDataSharingAgreement
  )
  @SuccessResponse(200, 'success')
  async acceptInvite(
    @Request() request: express.Request,
    @Path('agreementId') agreementId: string
  ) {
    await dataSharingAgreementService.revokeDataSharingAgreement(
      agreementId,
      request.user.userGuid
    );
    return { status: httpStatus.OK, message: 'success' };
  }
}
