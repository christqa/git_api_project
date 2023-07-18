export const DefaultSecurityMethod = 'auth0';
export const DefaultSecurityMethods = {
  auth0: ['read', 'write', 'delete'],
};
export const CT_ADMIN_ROLE = 'ct-admin';
export const AdminSecurityMethods = {
  auth0: [CT_ADMIN_ROLE],
};

export const TRANSLATION_DICTIONARY_DIR = `${__dirname}/i18n`;
export const SUPPORTED_LANGUAGE_ISO_LIST = ['en', 'cn'];
export const DATE_FORMAT_ISO8601 = 'YYYY-MM-DDTHH:mm:ssZ';
