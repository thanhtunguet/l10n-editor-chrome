import type {OpenAISettings} from 'src/models/openai-settings';

export const FIGMA_API_URL: string = 'https://api.figma.com/v1';

export const countryCodeMap: Record<string, string> = {
  vi: 'Vietnamese',
  en: 'English',
  kr: 'Korean',
  jp: 'Japanese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  es: 'Spanish',
  pt: 'Portuguese',
  ru: 'Russian',
  tr: 'Turkish',
  ar: 'Arabic',
  cn: 'Chinese',
  tw: 'Taiwanese',
  th: 'Thai',
  id: 'Indonesian',
  ms: 'Malay',
  fil: 'Filipino',
  pl: 'Polish',
  nl: 'Dutch',
  hu: 'Hungarian',
  el: 'Greek',
  bg: 'Bulgarian',
  cz: 'Czech',
  sk: 'Slovak',
  ro: 'Romanian',
  hr: 'Croatian',
  sr: 'Serbian',
  sl: 'Slovenian',
  mk: 'Macedonian',
  al: 'Albanian',
  ba: 'Bosnian',
  me: 'Montenegrin',
  rs: 'Serbian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  ee: 'Estonian',
  fi: 'Finnish',
  se: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  is: 'Icelandic',
  ie: 'Irish',
  gb: 'British',
  au: 'Australian',
  nz: 'New Zealand',
};

export const OPENAI_DEFAULT_SETTINGS: OpenAISettings = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4-turbo',
  systemPrompt: `You are a developer experienced in multilingual systems and app localization.  
I will provide a localization key (in dot-separated camel case) and a translation in a source language.  
I will also provide a list of missing locales (2-character locale codes).  

Your task is to translate the given text into the specified missing locales while ensuring:  
- The translated text maintains a similar length to the source translation.  
- The translation aligns with the key’s significant meaning.  
- The tone and context remain appropriate for app localization.  
- Try to use the meaning of the **last word** in the localization key to guide the translation.  

Respond **only** with a JSON object where the keys are the locale codes and the values are the translations.  
Do not include explanations, comments, or any extra characters.`,
};
