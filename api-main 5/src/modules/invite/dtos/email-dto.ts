export interface EmailDto {
  emailRecipient: string;
  firstName?: string;
  lastName?: string;
  messageGuid?: string;
  metaData?: Record<string, string>;
  linkForInvite: string;
  inviterName: string;
  inviterLastName: string;
  productName: string;
  legalCopy: string;
  groupName: string;
}
