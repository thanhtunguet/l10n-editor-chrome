/**
 * Comprehensive type definitions for the L10n Editor application
 */

// Re-export error types
export * from './errors';

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Localization types
export interface LocaleCode {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface TranslationKey {
  key: string;
  namespace?: string;
  description?: string;
  context?: string;
}

export interface Translation {
  key: string;
  locale: string;
  value: string;
  lastModified?: Date;
  modifiedBy?: string;
}

export interface LocalizationProject {
  id: string;
  name: string;
  description?: string;
  defaultLocale: string;
  supportedLocales: string[];
  createdAt: Date;
  updatedAt: Date;
}

// File types
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: Date;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export interface ExportOptions {
  format: 'json' | 'xlsx' | 'csv' | 'arb';
  locales?: string[];
  namespaces?: string[];
  includeEmpty?: boolean;
}

// AI Translation types
export interface AITranslationRequest {
  sourceText: string;
  sourceLocale: string;
  targetLocale: string;
  context?: string;
  key?: string;
}

export interface AITranslationResponse {
  translatedText: string;
  confidence: number;
  alternatives?: string[];
  reasoning?: string;
}

export interface AIModelConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  model: string;
  baseUrl?: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

// Figma types
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  characters?: string;
  style?: any;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, any>;
  styles: Record<string, any>;
}

export interface FigmaExportOptions {
  fileId: string;
  nodeIds?: string[];
  filterByName?: string;
  includeComponents?: boolean;
}

// DevOps types (Azure DevOps, GitHub, etc.)
export interface Repository {
  id: string;
  name: string;
  url: string;
  defaultBranch: string;
  provider: 'azure' | 'github' | 'gitlab' | 'bitbucket';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  repositories: Repository[];
}

export interface GitCommit {
  id: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  timestamp: Date;
  changes: GitFileChange[];
}

export interface GitFileChange {
  path: string;
  changeType: 'add' | 'modify' | 'delete' | 'rename';
  content?: string;
}

// UI State types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number;
  fixed?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
}

export interface TableState<T = any> {
  data: T[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  filters: Record<string, any>;
  sorter: {
    field?: string;
    order?: 'ascend' | 'descend';
  };
  selection: {
    selectedRowKeys: string[];
    selectedRows: T[];
  };
}

export interface ModalState {
  visible: boolean;
  loading: boolean;
  data?: any;
  mode: 'create' | 'edit' | 'view';
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any }>;
  validation?: any[];
}

export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  loading: boolean;
  dirty: boolean;
}

// Settings types
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dateFormat: string;
  timeFormat: string;
  notifications: {
    desktop: boolean;
    sound: boolean;
    email: boolean;
  };
}

export interface UserPreferences {
  editor: {
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    showLineNumbers: boolean;
  };
  table: {
    pageSize: number;
    showBorders: boolean;
    compactMode: boolean;
  };
}

// Chrome Extension types
export interface ChromeMessage {
  type: string;
  payload?: any;
  tabId?: number;
  timestamp: number;
}

export interface ChromeStorageData {
  [key: string]: any;
}

// Event types
export interface AppEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  source: string;
}

export type EventHandler<T = any> = (event: AppEvent<T>) => void;

// Utility types for async operations
export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetch?: Date;
}

export interface AsyncAction<T = any> {
  type: 'LOADING' | 'SUCCESS' | 'ERROR' | 'RESET';
  payload?: T;
  error?: Error;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  testId?: string;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
  size?: 'small' | 'default' | 'large';
}

export interface ErrorProps {
  error?: Error | null;
  onRetry?: () => void;
  showRetry?: boolean;
}

// Constants
export const SUPPORTED_LOCALES = [
  'vi', 'en', 'zh', 'ja', 'ko', 'th', 'id', 'ms', 'tl',
  'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'hi', 'bn'
] as const;

export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export const FILE_FORMATS = ['json', 'xlsx', 'csv', 'arb'] as const;
export type FileFormat = typeof FILE_FORMATS[number];

export const AI_PROVIDERS = ['openai', 'anthropic', 'google', 'custom'] as const;
export type AIProvider = typeof AI_PROVIDERS[number];