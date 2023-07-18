import { PermissionTypes } from '../../invite/invite.type';

export interface IDataSharingResponseDto {
  agreementId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  permissions: PermissionTypes[];
  agreedAt: Date;
  revokedAt: Date;
}
