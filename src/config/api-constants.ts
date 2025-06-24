/**
 * API-related constants for external services
 */

// OpenAI API Configuration
export const OPENAI_API = {
  BASE_URL: 'https://api.openai.com/v1',
  DEFAULT_MODEL: 'gpt-4-turbo',
  DEFAULT_TEMPERATURE: 0.3,
  DEFAULT_MAX_TOKENS: 1000,
  RATE_LIMIT_DELAY: 100, // ms between requests
} as const;

// Figma API Configuration
export const FIGMA_API = {
  BASE_URL: 'https://api.figma.com/v1',
  FILE_ENDPOINT: '/files',
  NODES_ENDPOINT: '/nodes',
} as const;

// Azure DevOps API Configuration
export const AZURE_DEVOPS_API = {
  VERSION: '6.0-preview',
  ENDPOINTS: {
    PROJECTS: '/_apis/projects',
    REPOSITORIES: '/_apis/git/repositories',
    ITEMS: '/_apis/git/repositories/{repositoryId}/items',
    BLOBS: '/_apis/git/repositories/{repositoryId}/blobs/{objectId}',
    PUSHES: '/_apis/git/repositories/{repositoryId}/pushes',
  },
  RECURSION_LEVEL: 'Full',
} as const;

// HTTP Configuration
export const HTTP_CONFIG = {
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// File Processing
export const FILE_PROCESSING = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_EXCEL_FORMATS: ['.xlsx', '.xls'] as const,
  SUPPORTED_JSON_FORMATS: ['.json'] as const,
  DOWNLOAD_CLEANUP_DELAY: 100, // ms
} as const;
