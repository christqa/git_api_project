/* istanbul ignore file */

import { ManagementClient, Role, User } from 'auth0';
import config from '@core/enviroment-variable-config';

const managementAPI = new ManagementClient({
  domain: config.auth0ManagementDomain,
  clientId: config.auth0ClientId,
  clientSecret: config.auth0ClientSecret,
  scope: 'update:users read:roles',
});

const findUserByAuthId = (id: string): Promise<User> => {
  return managementAPI.getUser({ id });
};

const managementApiAccessToken = () => {
  return managementAPI.getAccessToken();
};

const getUserRoles = (auth0UserId: string): Promise<Role[]> => {
  return managementAPI.getUserRoles({ id: auth0UserId });
};

export { findUserByAuthId, managementApiAccessToken, getUserRoles };
