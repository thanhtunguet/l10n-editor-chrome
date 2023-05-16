export type LocalizationKey = string;

export type LocaleCode = string;

export interface Localization {
  [key: LocaleCode]: string;
}

export interface LocalizationMap {
  [key: LocalizationKey]: Localization;
}
