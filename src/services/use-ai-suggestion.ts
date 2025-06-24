import OpenAI from 'openai';
import React from 'react';
import type {LocalizationRecord} from 'src/models/localization-record';
import type {IAITranslationService} from '../interfaces/services';
import type {AITranslationRequest, AITranslationResponse} from '../types';
import {
  ApiError,
  ValidationError,
  AuthenticationError,
  ErrorHandler,
} from '../types/errors';
import {OPENAI_API} from '../config/api-constants';
import useOpenAISettings from './use-openai-settings';

/**
 * AI Translation Service Implementation
 */
class AITranslationService implements IAITranslationService {
  private openai: OpenAI | null = null;
  private settings: any;

  public constructor(settings: any) {
    this.settings = settings;
    this.initializeOpenAI();
  }

  private initializeOpenAI(): void {
    try {
      if (!this.settings.apiKey) {
        throw new AuthenticationError('OpenAI API key is required');
      }

      this.openai = new OpenAI({
        dangerouslyAllowBrowser: true,
        baseURL: this.settings.baseUrl,
        apiKey: this.settings.apiKey,
      });
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Get AI translation suggestion for a single record
   */
  public async getSuggestion(
    record: LocalizationRecord,
  ): Promise<LocalizationRecord> {
    try {
      if (!record.key) {
        throw new ValidationError('Localization record must have a key');
      }

      if (!this.openai) {
        throw new AuthenticationError('OpenAI client not initialized');
      }

      const {key, ...restTranslations} = record;
      const notTranslatedKeys = Object.keys(restTranslations).filter(
        (lang) => !restTranslations[lang],
      );

      if (notTranslatedKeys.length === 0) {
        return record; // No translation needed
      }

      const userPrompt = this.getUserPrompt(record);
      const completion = await this.openai.chat.completions.create({
        model: this.settings.model,
        messages: [
          {
            role: 'system',
            content: this.settings.systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: OPENAI_API.DEFAULT_TEMPERATURE,
        max_tokens: OPENAI_API.DEFAULT_MAX_TOKENS,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new ApiError('Empty response from OpenAI API');
      }

      let translations: Record<string, string>;
      try {
        translations = JSON.parse(responseContent);
      } catch (parseError) {
        throw new ApiError(
          'Invalid JSON response from OpenAI API',
          undefined,
          undefined,
          {context: {response: responseContent}},
        );
      }

      return {
        key,
        ...restTranslations,
        ...translations,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes('401') ||
          error.message.includes('authentication')
        ) {
          throw new AuthenticationError('Invalid OpenAI API key');
        }
        if (error.message.includes('rate limit')) {
          throw new ApiError('OpenAI API rate limit exceeded');
        }
        if (
          error.message.includes('network') ||
          error.message.includes('timeout')
        ) {
          throw new ApiError('Network error connecting to OpenAI API');
        }
      }

      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Get AI translation suggestion for specific text
   */
  public async translateText(
    request: AITranslationRequest,
  ): Promise<AITranslationResponse> {
    try {
      if (!request.sourceText || !request.targetLocale) {
        throw new ValidationError('Source text and target locale are required');
      }

      if (!this.openai) {
        throw new AuthenticationError('OpenAI client not initialized');
      }

      const prompt = `Translate the following text from ${
        request.sourceLocale || 'auto-detect'
      } to ${request.targetLocale}:\n\n"${request.sourceText}"\n\n${
        request.context ? `Context: ${request.context}` : ''
      }\n\nProvide only the translation, no additional text.`;

      const completion = await this.openai.chat.completions.create({
        model: this.settings.model,
        messages: [
          {
            role: 'system',
            content:
              'You are a professional translator. Provide accurate, natural translations that preserve meaning and tone.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: OPENAI_API.DEFAULT_TEMPERATURE,
        max_tokens: 500,
      });

      const translatedText = completion.choices[0]?.message?.content?.trim();
      if (!translatedText) {
        throw new ApiError('Empty response from OpenAI API');
      }

      return {
        translatedText,
        confidence: 0.9, // OpenAI doesn't provide confidence scores
        alternatives: [],
      };
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Batch translate multiple records
   */
  public async batchTranslate(
    records: LocalizationRecord[],
  ): Promise<LocalizationRecord[]> {
    try {
      const results: LocalizationRecord[] = [];

      for (const record of records) {
        try {
          const translated = await this.getSuggestion(record);
          results.push(translated);

          // Add delay to respect rate limits
          await new Promise((resolve) =>
            setTimeout(resolve, OPENAI_API.RATE_LIMIT_DELAY),
          );
        } catch (error) {
          ErrorHandler.log(ErrorHandler.normalize(error));
          results.push(record); // Keep original if translation fails
        }
      }

      return results;
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Validate AI service configuration
   */
  public async validateConfiguration(settings: any): Promise<boolean> {
    try {
      const testClient = new OpenAI({
        dangerouslyAllowBrowser: true,
        baseURL: settings.baseUrl,
        apiKey: settings.apiKey,
      });

      const response = await testClient.chat.completions.create({
        model: settings.model,
        messages: [{role: 'user', content: 'Test'}],
        max_tokens: 5,
      });

      return !!response.choices[0]?.message;
    } catch {
      return false;
    }
  }

  private getUserPrompt(record: LocalizationRecord): string {
    const {key, ...restTranslations} = record;

    const translatedKeys = Object.keys(restTranslations).filter(
      (lang) => !!restTranslations[lang],
    );

    const notTranslatedKeys = Object.keys(restTranslations).filter(
      (lang) => !restTranslations[lang],
    );

    return `The localization key is: "${key}"\n\nExisting translations:\n${translatedKeys
      .map((lang) => `${lang}: "${restTranslations[lang]}"`)
      .join('\n')}\n\nPlease provide translations for: ${notTranslatedKeys.join(
      ', ',
    )}\n\nReturn only a JSON object with the missing translations in this format:\n{"${
      notTranslatedKeys[0]
    }": "translation", "${notTranslatedKeys[1] || 'locale'}": "translation"}`;
  }
}

/**
 * React hook for AI translation suggestions
 */
export const useAiSuggestion = (): {
  handleGetAiSuggestion: (
    record: LocalizationRecord,
  ) => Promise<LocalizationRecord>;
} => {
  const {settings} = useOpenAISettings();
  const aiServiceRef = React.useRef<AITranslationService | null>(null);

  // Initialize AI service when settings change
  React.useEffect(() => {
    try {
      aiServiceRef.current = new AITranslationService(settings);
    } catch (error) {
      // Service will be null if initialization fails
      aiServiceRef.current = null;
      ErrorHandler.log(ErrorHandler.normalize(error));
    }
  }, [settings.apiKey, settings.baseUrl, settings.model, settings]);

  const handleGetAiSuggestion = React.useCallback(
    async (record: LocalizationRecord): Promise<LocalizationRecord> => {
      try {
        if (!aiServiceRef.current) {
          throw new AuthenticationError(
            'AI service not initialized. Please check your API configuration.',
          );
        }

        // eslint-disable-next-line no-console
        console.info(`Getting AI translation for key: ${record.key}`);
        return await aiServiceRef.current.getSuggestion(record);
      } catch (error) {
        const appError = ErrorHandler.normalize(error);
        ErrorHandler.log(appError);

        // For backward compatibility, return original record on error
        // UI will handle error display
        return record;
      }
    },
    [],
  );

  return {
    handleGetAiSuggestion,
  };
};

// Export the service class for direct usage
export {AITranslationService};
