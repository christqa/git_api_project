import TranslationService from '@modules/translation/translation.service';
import { notFoundError } from '@core/error-handling/error-list';

const noGlobalSettings = () => {
  return notFoundError(
    TranslationService.translate('global_settings_settings_not_found')
  );
};

const noGlobalSetting = () => {
  return notFoundError(
    TranslationService.translate('global_setting_not_found')
  );
};

const globalSettingNotFound = () => {
  return notFoundError(
    TranslationService.translate('global_setting_find_by_id_not_found')
  );
};

export { noGlobalSettings, noGlobalSetting, globalSettingNotFound };
