import TranslationService from '@modules/translation/translation.service';

describe('Translation service', () => {
  beforeAll(async () => {
    await TranslationService.loadTranslationDictionaries();
  });
  test('load Translations', () => {
    const struct = TranslationService.translate(
      'device-activation_activated_device_not_found'
    );
    expect(struct).toBeDefined();
  });
  test('replace variables', () => {
    const struct = TranslationService.translate(
      'user_dob_must_be_max_current_date',
      { date: '12/02/2000' }
    );
    expect(struct).toBeDefined();
  });
});
