import OpenAI from 'openai';
import React from 'react';
import type {LocalizationRecord} from 'src/models/localization-record';
import useOpenAISettings from './use-openai-settings';

function getUserPrompt(record: LocalizationRecord): string {
  const {key, ...restTranslations} = record;

  const translatedKeys = Object.keys(restTranslations).filter((lang) => {
    return !!restTranslations[lang];
  });

  const notTranslatedKeys = Object.keys(restTranslations).filter((lang) => {
    return !restTranslations[lang];
  });

  return `The key is: "${key}"
  ${translatedKeys
    .map((lang) => `Translation in ${lang}: "${restTranslations[lang]}"`)
    .join('\n')}
    Need to get translation in ${notTranslatedKeys.join(', ')}`;
}

export const useAiSuggestion = (): {
  handleGetAiSuggestion: (
    record: LocalizationRecord,
  ) => Promise<Omit<LocalizationRecord, 'key'>>;
} => {
  const {settings} = useOpenAISettings();

  const {apiKey, baseUrl, model} = settings;

  const openaiRef = React.useRef<OpenAI | null>(null);

  React.useEffect(() => {
    openaiRef.current = new OpenAI({
      dangerouslyAllowBrowser: true,
      baseURL: baseUrl,
      apiKey: apiKey,
    });
  }, [apiKey, baseUrl]);

  const {
    settings: {systemPrompt},
  } = useOpenAISettings();

  const handleGetAiSuggestion = React.useCallback(
    async (
      record: LocalizationRecord,
    ): Promise<Omit<LocalizationRecord, 'key'>> => {
      const {key, ...restTranslations} = record;

      // eslint-disable-next-line no-console
      console.info(`Getting translation for ${key}`);

      const notTranslatedKeys = Object.keys(restTranslations).filter((lang) => {
        return !restTranslations[lang];
      });

      if (notTranslatedKeys.length) {
        const completion = await openaiRef.current?.chat.completions.create({
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: getUserPrompt(record),
            },
          ],
        });
        const json: string | null | undefined =
          completion?.choices[0].message.content;

        return JSON.parse(json ?? '{}');
      }

      return {};
    },
    [model, systemPrompt],
  );

  return {
    handleGetAiSuggestion,
  };
};
