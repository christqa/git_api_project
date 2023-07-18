/* istanbul ignore file */

import Joi from 'joi';

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid('production', 'development', 'test')
      .required(),
    DATABASE_URL: Joi.string().required().description('Postgresql DB url'),
    PORT: Joi.number().default(3000),
    AUTH0_AUDIENCE: Joi.string().required(),
    AUTH0_ISSUER: Joi.string().required(),
    AUTH0_MANAGEMENT_DOMAIN: Joi.string().required(),
    AUTH0_CLIENT_SECRET: Joi.string().required(),
    AUTH0_CLIENT_ID: Joi.string().required(),
    CHECK_USER_EMAIL_IS_VERIFIED: Joi.boolean().default(true).required(),
    CHECK_USER_EMAIL_IS_UNIQUE: Joi.boolean().default(true).required(),
    PDF_GENERATION_SERVICE_URL: Joi.string().required(),
    AWS_ACCESS_KEY_ID: Joi.string().required(),
    AWS_SECRET_ACCESS_KEY: Joi.string().required(),
    AWS_SESSION_TOKEN: Joi.string().optional(),
    AWS_SNS_REGION: Joi.string().required(),
    AWS_SNS_PLATFORM_APP_ARN: Joi.string().required(),
    AWS_SNS_APNS_KEY: Joi.string().required(),
    AWS_DEVICE_EVENT_SNS_REGION: Joi.string().required(),
    INVITE_GROUP_MAX_PERIOD_DAYS: Joi.number().required(),
    IOS_NOTIFICATION_DEEP_LINK_PREFIX: Joi.string().required(),
    IOS_NOTIFICATION_LOW_BATTERY_THRESHOLD: Joi.number().default(20),
    AWS_SQS_REGION: Joi.string().required(),
    AWS_SNS_DEVICE_EVENT_TOPIC_ARN: Joi.string().required(),
    AWS_SQS_DEVICE_EVENTS_MSG_QUEUE: Joi.string().required(),
    TOGGLE_UNLEASH_DOMAIN: Joi.string().required(),
    TOGGLE_UNLEASH_APPNAME: Joi.string().required(),
    TOGGLE_UNLEASH_APPTOKEN: Joi.string().required(),
    MAX_INVITES_UNACCEPTED_PER_ADMIN: Joi.number().required(),
    MAX_INVITES_FOR_ADMIN_FOR_SAME_USER_SAME_GROUP_THRESHOLD:
      Joi.number().required(),
    MAX_INVITES_FOR_ADMIN_FOR_SAME_USER_SAME_GROUP_PERIOD_HOURS:
      Joi.number().required(),
    TOGGLE_UNLEASH_ENABLED: Joi.boolean().required(),
    AWS_XRAY_DAEMON_ADDRESS: Joi.string().required(),
    AWS_XRAY_PLUGINS_ENABLED: Joi.boolean().default(true),
    DATA_PRIVACY_REMOVAL_REQUEST_EMAIL_RECIPIENT: Joi.string().required(),
    STATIC_ASSETS_BASE_URL: Joi.string().required(),
    APPSFLYER_LINK: Joi.string().required(),
    CUMULATIVE_SCORE_TREND_INDICATOR_DOWN_THRESHOLD: Joi.number().default(40),
    BASIC_AUTH_USERNAME: Joi.string().required(),
    BASIC_AUTH_PASSWORD: Joi.string().required(),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  port: envVars.PORT,
  env: envVars.NODE_ENV,
  auth0Audience: envVars.AUTH0_AUDIENCE,
  auth0Issuer: envVars.AUTH0_ISSUER,
  auth0ManagementDomain: envVars.AUTH0_MANAGEMENT_DOMAIN,
  checkUserEmailIsVerified: envVars.CHECK_USER_EMAIL_IS_VERIFIED,
  checkUserEmailIsUnique: envVars.CHECK_USER_EMAIL_IS_UNIQUE,
  auth0ClientSecret: envVars.AUTH0_CLIENT_SECRET,
  auth0ClientId: envVars.AUTH0_CLIENT_ID,
  awsAccessKeyId: envVars.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  SessionToken: envVars.AWS_SESSION_TOKEN,
  awsSnsRegion: envVars.AWS_SNS_REGION,
  awsDeviceEventSnsRegion: envVars.AWS_DEVICE_EVENT_SNS_REGION,
  inviteGroupMaxPeriodDays: envVars.INVITE_GROUP_MAX_PERIOD_DAYS,
  awsSnsPlatformAppArn: envVars.AWS_SNS_PLATFORM_APP_ARN,
  awsSnsApnsKey: envVars.AWS_SNS_APNS_KEY,
  iosNotificationDeepLinkPrefix: envVars.IOS_NOTIFICATION_DEEP_LINK_PREFIX,
  iosNotificationLowBatteryThreshold:
    envVars.IOS_NOTIFICATION_LOW_BATTERY_THRESHOLD,
  awsSQSRegion: envVars.AWS_SQS_REGION,
  awsSQSApiVersion: envVars.AWS_SQS_API_VERSION,
  awsSnsDeviceEventTopicArn: envVars.AWS_SNS_DEVICE_EVENT_TOPIC_ARN,
  awsSqsDeviceEventsMsgQueueArn: envVars.AWS_SQS_DEVICE_EVENTS_MSG_QUEUE,
  toggleUnleashDomain: envVars.TOGGLE_UNLEASH_DOMAIN,
  toggleUnleashAppName: envVars.TOGGLE_UNLEASH_APPNAME,
  toggleUnleashAppToken: envVars.TOGGLE_UNLEASH_APPTOKEN,
  maxInvitesUnacceptedPerAdmin: envVars.MAX_INVITES_UNACCEPTED_PER_ADMIN,
  maxInvitesForAdminForSameUserSameGroupThreshold:
    envVars.MAX_INVITES_FOR_ADMIN_FOR_SAME_USER_SAME_GROUP_THRESHOLD,
  maxInvitesForAdminForSameUserSameGroupPeriodHours:
    envVars.MAX_INVITES_FOR_ADMIN_FOR_SAME_USER_SAME_GROUP_PERIOD_HOURS,
  toggleUnleashEnabled: envVars.TOGGLE_UNLEASH_ENABLED,
  awsXrayDaemonAddress: envVars.AWS_XRAY_DAEMON_ADDRESS,
  awsXrayPluginsEnabled: envVars.AWS_XRAY_PLUGINS_ENABLED,
  staticAssetsBaseUrl: envVars.STATIC_ASSETS_BASE_URL,
  dataPrivacyRemovalRequestEmailRecipient:
    envVars.DATA_PRIVACY_REMOVAL_REQUEST_EMAIL_RECIPIENT,
  appsFlyerLink: envVars.APPSFLYER_LINK,
  cumulativeScoreTrendIndicatorDownThreshold:
    envVars.CUMULATIVE_SCORE_TREND_INDICATOR_DOWN_THRESHOLD,
  basicAuthUserName: envVars.BASIC_AUTH_USERNAME,
  basicAuthPassword: envVars.BASIC_AUTH_PASSWORD,
};
