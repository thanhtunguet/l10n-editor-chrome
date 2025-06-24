/**
 * Application-wide constants and configuration
 */

// Application Metadata
export const APP_INFO = {
  NAME: 'Localization Editor',
  VERSION: '2.1.5',
  DESCRIPTION: 'Localization editor for Flutter and React projects',
  AUTHOR: 'L10n Editor Team',
} as const;

// Chrome Extension Configuration
export const CHROME_EXTENSION = {
  MANIFEST_VERSION: 3,
  PERMISSIONS: [
    'activeTab',
    'cookies',
    'storage',
    'tabs',
    'scripting',
  ] as const,
  STORAGE_KEYS: {
    OPENAI_SETTINGS: 'openai-settings',
    EXTENSION_SETTINGS: 'extension-settings',
    USER_PREFERENCES: 'user-preferences',
    RECENT_FILES: 'recent-files',
    DEVOPS_SERVERS: 'devops-servers',
  } as const,
} as const;

// Project Types
export const PROJECT_TYPES = {
  REACT: 'react',
  FLUTTER: 'flutter',
  REACT_NATIVE: 'react-native',
} as const;

// File Paths by Project Type
export const PROJECT_PATHS = {
  [PROJECT_TYPES.REACT]: {
    I18N_PATH: 'src/i18n',
    LOCALE_FILES: '**/*.json',
  },
  [PROJECT_TYPES.FLUTTER]: {
    L10N_PATH: 'lib/l10n',
    LOCALE_FILES: '**/*.arb',
  },
  [PROJECT_TYPES.REACT_NATIVE]: {
    I18N_PATH: 'src/i18n',
    LOCALE_FILES: '**/*.json',
  },
} as const;

// Environment Configuration
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  AI_TRANSLATION: true,
  FIGMA_INTEGRATION: true,
  DEVOPS_INTEGRATION: true,
  BATCH_TRANSLATION: true,
  EXPORT_FORMATS: ['json', 'xlsx', 'csv', 'arb'] as const,
} as const;

// Limits and Quotas
export const LIMITS = {
  MAX_LOCALIZATION_KEYS: 10000,
  MAX_LOCALES: 50,
  MAX_KEY_LENGTH: 255,
  MAX_TRANSLATION_LENGTH: 2000,
  MAX_BATCH_SIZE: 100,
  MAX_FILE_SIZE_MB: 10,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutes
  MAX_ENTRIES: 100,
  STORAGE_KEY: 'l10n-cache',
} as const;

// Telemetry Events
export const TELEMETRY_EVENTS = {
  APP_STARTED: 'app_started',
  FILE_IMPORTED: 'file_imported',
  FILE_EXPORTED: 'file_exported',
  TRANSLATION_REQUESTED: 'translation_requested',
  ERROR_OCCURRED: 'error_occurred',
  FIGMA_EXPORT: 'figma_export',
  DEVOPS_CONNECTED: 'devops_connected',
} as const;
