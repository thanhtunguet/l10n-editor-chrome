/**
 * Service interfaces for dependency injection and testing
 */

import { Observable } from 'rxjs';
import {
  LocalizationRecord,
  OpenAISettings,
  FigmaLinkForm,
  DevopsServer,
  AzureProjectResponse,
  AzurerRepositoryResponse,
  AzureGitObjectResponse,
  GitObject,
} from '../models';
import {
  AITranslationRequest,
  AITranslationResponse,
  ExportOptions,
  ImportResult,
  FileInfo,
  FigmaExportOptions,
  Repository,
  Project,
  GitCommit,
  AppError,
} from '../types';

/**
 * Localization Service Interface
 */
export interface ILocalizationService {
  /**
   * Generate and download localization files as ZIP
   */
  generateAndDownloadLocalizationZip(localizations: LocalizationRecord[]): Promise<void>;

  /**
   * Export localizations to Excel format
   */
  exportToExcel(localizations: LocalizationRecord[]): Promise<Blob>;

  /**
   * Import localizations from Excel file
   */
  importFromExcel(file: File): Promise<ImportResult>;

  /**
   * Import localizations from JSON files
   */
  importFromJson(files: FileList): Promise<ImportResult>;

  /**
   * Validate localization data
   */
  validateLocalizations(localizations: LocalizationRecord[]): Promise<ValidationResult>;

  /**
   * Group localizations by locale
   */
  groupByLocale(localizations: LocalizationRecord[]): Record<string, Record<string, string>>;
}

/**
 * AI Translation Service Interface
 */
export interface IAITranslationService {
  /**
   * Get AI translation suggestion for a single record
   */
  getSuggestion(record: LocalizationRecord): Promise<LocalizationRecord>;

  /**
   * Get AI translation suggestion for specific text
   */
  translateText(request: AITranslationRequest): Promise<AITranslationResponse>;

  /**
   * Batch translate multiple records
   */
  batchTranslate(records: LocalizationRecord[]): Promise<LocalizationRecord[]>;

  /**
   * Validate AI service configuration
   */
  validateConfiguration(settings: OpenAISettings): Promise<boolean>;
}

/**
 * Figma Service Interface
 */
export interface IFigmaService {
  /**
   * Export text nodes from Figma file
   */
  exportFromFigma(form: FigmaLinkForm): Promise<LocalizationRecord[]>;

  /**
   * Fetch all text nodes from Figma file
   */
  fetchTextNodes(options: FigmaExportOptions): Promise<FigmaNode[]>;

  /**
   * Validate Figma API configuration
   */
  validateApiKey(apiKey: string): Promise<boolean>;

  /**
   * Parse Figma file URL to extract file ID
   */
  parseFileUrl(url: string): string | null;
}

/**
 * DevOps Repository Service Interface
 */
export interface IDevOpsService {
  /**
   * Get all projects from DevOps server
   */
  getProjects(): Observable<Project[]>;

  /**
   * Get repositories for a specific project
   */
  getRepositories(projectId: string): Observable<Repository[]>;

  /**
   * Get git objects (files/folders) from repository
   */
  getGitObjects(projectId: string, repositoryId: string): Observable<GitObject[]>;

  /**
   * Read file content from repository
   */
  readFile(
    server: DevopsServer,
    projectId: string,
    repositoryId: string,
    gitObject: GitObject,
  ): Promise<Record<string, string>>;

  /**
   * Update files in repository
   */
  updateFiles(
    repositoryId: string,
    commitId: string,
    files: Record<string, string>,
  ): Promise<GitCommit>;

  /**
   * Get latest commit ID for repository
   */
  getLatestCommitId(repositoryId: string): Observable<string>;

  /**
   * Validate DevOps server configuration
   */
  validateServer(server: DevopsServer): Promise<boolean>;
}

/**
 * Settings Service Interface
 */
export interface ISettingsService {
  /**
   * Get OpenAI settings
   */
  getOpenAISettings(): Promise<OpenAISettings>;

  /**
   * Save OpenAI settings
   */
  setOpenAISettings(settings: OpenAISettings): Promise<void>;

  /**
   * Get extension settings
   */
  getExtensionSettings(): Promise<ExtensionSettings>;

  /**
   * Save extension settings
   */
  setExtensionSettings(settings: ExtensionSettings): Promise<void>;

  /**
   * Clear all settings
   */
  clearSettings(): Promise<void>;

  /**
   * Export settings to file
   */
  exportSettings(): Promise<Blob>;

  /**
   * Import settings from file
   */
  importSettings(file: File): Promise<void>;
}

/**
 * File Service Interface
 */
export interface IFileService {
  /**
   * Read file as text
   */
  readAsText(file: File): Promise<string>;

  /**
   * Read file as JSON
   */
  readAsJson<T = any>(file: File): Promise<T>;

  /**
   * Read file as ArrayBuffer
   */
  readAsArrayBuffer(file: File): Promise<ArrayBuffer>;

  /**
   * Download file with given content
   */
  downloadFile(content: string | Blob, filename: string, mimeType?: string): void;

  /**
   * Create ZIP archive from files
   */
  createZip(files: Record<string, string>): Promise<Blob>;

  /**
   * Extract files from ZIP archive
   */
  extractZip(zipFile: File): Promise<Record<string, string>>;

  /**
   * Validate file format
   */
  validateFileFormat(file: File, allowedFormats: string[]): boolean;

  /**
   * Get file information
   */
  getFileInfo(file: File): FileInfo;
}

/**
 * Storage Service Interface (Chrome Extension Storage)
 */
export interface IStorageService {
  /**
   * Get item from storage
   */
  get<T = any>(key: string): Promise<T | null>;

  /**
   * Set item in storage
   */
  set<T = any>(key: string, value: T): Promise<void>;

  /**
   * Remove item from storage
   */
  remove(key: string): Promise<void>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys from storage
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Get multiple items from storage
   */
  getMultiple<T = any>(keys: string[]): Promise<Record<string, T>>;

  /**
   * Set multiple items in storage
   */
  setMultiple<T = any>(items: Record<string, T>): Promise<void>;

  /**
   * Listen to storage changes
   */
  onChanged(callback: (changes: Record<string, any>) => void): () => void;
}

/**
 * Notification Service Interface
 */
export interface INotificationService {
  /**
   * Show success notification
   */
  success(message: string, description?: string): void;

  /**
   * Show error notification
   */
  error(message: string, description?: string): void;

  /**
   * Show warning notification
   */
  warning(message: string, description?: string): void;

  /**
   * Show info notification
   */
  info(message: string, description?: string): void;

  /**
   * Close all notifications
   */
  destroy(): void;

  /**
   * Show loading notification
   */
  loading(message: string, duration?: number): () => void;
}

/**
 * Analytics Service Interface
 */
export interface IAnalyticsService {
  /**
   * Track user event
   */
  track(event: string, properties?: Record<string, any>): void;

  /**
   * Track page view
   */
  page(pageName: string, properties?: Record<string, any>): void;

  /**
   * Track error
   */
  error(error: AppError, context?: Record<string, any>): void;

  /**
   * Set user properties
   */
  identify(userId: string, properties?: Record<string, any>): void;

  /**
   * Track performance metric
   */
  timing(name: string, duration: number, properties?: Record<string, any>): void;
}

// Additional utility interfaces

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  warnings: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    key: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  warnings: Array<{
    key: string;
    message: string;
  }>;
}

export interface ExtensionSettings {
  figmaApiKey?: string;
  reactPath?: string;
  flutterPath?: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  autoSave?: boolean;
  notifications?: boolean;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  characters?: string;
  style?: any;
  children?: FigmaNode[];
}

// Service registry for dependency injection
export interface IServiceRegistry {
  localizationService: ILocalizationService;
  aiTranslationService: IAITranslationService;
  figmaService: IFigmaService;
  devOpsService: IDevOpsService;
  settingsService: ISettingsService;
  fileService: IFileService;
  storageService: IStorageService;
  notificationService: INotificationService;
  analyticsService: IAnalyticsService;
}

// Factory function type for creating services
export type ServiceFactory<T> = (...args: any[]) => T;