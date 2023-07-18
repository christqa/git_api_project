import * as fs from 'fs/promises';
import {
  ITranslation,
  TranslatedMessageType,
  TranslationPropType,
} from '@modules/translation/translation.types';
import { TRANSLATION_DICTIONARY_DIR } from '../../constants';
import logger from '@core/logger/logger';
import { resolve } from 'path';

export default class TranslationService {
  static translations: ITranslation[] = [];
  static translate(
    key: string,
    props?: TranslationPropType
  ): TranslatedMessageType {
    if (!this.translations || this.translations.length === 0) {
      return { key: key };
    }
    const message: { [x: string]: string } = {};
    for (const translation of this.translations) {
      // @ts-ignore
      let value = translation.dictionary[key];
      if (props) {
        for (const varKey of Object.keys(props)) {
          value = value.replace(`{{${varKey}}}`, `${props[varKey]}`);
        }
      }
      message[translation.languageIso] = value;
    }
    return message;
  }

  static async loadTranslationDictionaries() {
    // This will load translation string from local file
    // In future these strings should be moved to the database.
    logger.log(
      'info',
      'TranslationService: Starting to load translation dictionaries.'
    );
    try {
      const subdir = await fs.readdir(TRANSLATION_DICTIONARY_DIR);
      if (!subdir || subdir.length === 0) {
        logger.log('warn', 'TranslationService: No dictionaries to load');
        return;
      }
      for (const fileName of subdir) {
        const path = resolve(TRANSLATION_DICTIONARY_DIR, fileName);
        const dictionary = require(path);
        const languageIso = fileName.replace('.json', '').replace('error-', '');
        this.translations.push({ languageIso, dictionary });
      }
    } catch (err) {
      logger.log('error', `TranslationService: ${err}`);
    }
  }
}
