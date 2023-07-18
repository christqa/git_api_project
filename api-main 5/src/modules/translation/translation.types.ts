export type ITranslation = {
  languageIso: string;
  dictionary: TranslationDictionaryType;
};

export type TranslationDictionaryType = {
  [key: string]: string;
};

export type TranslationPropType = {
  [key: string]: string | number;
};

export type TranslatedMessageType = {
  [languageIso: string]: string;
};
