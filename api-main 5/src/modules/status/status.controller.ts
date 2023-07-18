import { statusService } from '@modules/index/index.service';
import { Controller } from '@tsoa/runtime';
import { Get, NoSecurity, Path, Route, Security, Tags } from 'tsoa';
import { DefaultSecurityMethods } from '../../constants';
import ApiError from '@core/error-handling/api-error';

@Tags('status')
@Route('/status')
@Security(DefaultSecurityMethods)
export class StatusController extends Controller {
  /**
   * Gets an app health status (emits version and build number of the backend app)
   */
  @Get()
  @NoSecurity()
  async getAppHealthStatus() {
    return statusService.getStatus();
  }
  /**
   * For testing error code
   *
   * */
  @Get('/error/{code}/{message}')
  @NoSecurity()
  async getErrorStatus(@Path() code: number, @Path() message: string) {
    throw new ApiError(code, message);
  }
}
