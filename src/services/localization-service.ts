import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import type {
  ILocalizationService,
  ValidationResult,
  ImportResult,
} from '../interfaces/services';
import type {LocalizationRecord} from '../models/localization-record';
import {
  FileProcessingError,
  ValidationError,
  ErrorHandler,
} from '../types/errors';
import {FILE_PROCESSING} from '../config/api-constants';

export class LocalizationService implements ILocalizationService {
  /**
   * Export localizations to Excel format
   */
  public async exportToExcel(
    localizations: LocalizationRecord[],
  ): Promise<Blob> {
    try {
      const workbook = XLSX.utils.book_new();
      const json = localizations.map((record) => ({
        key: record.key,
        ...Object.fromEntries(
          Object.entries(record).filter(([k]) => k !== 'key'),
        ),
      }));

      const worksheet = XLSX.utils.json_to_sheet(json);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Localizations');

      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      return new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      const appError = new FileProcessingError(
        'Failed to export localizations to Excel',
        'localizations.xlsx',
        {context: {originalError: error}},
      );
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Export localizations to Excel and trigger download
   */
  public async exportToLocalizationsExcel(
    localizations: Record<string, Record<string, string>>,
  ): Promise<void> {
    try {
      const localizationRecords = Object.entries(localizations).map(
        ([key, translations]) => ({
          key,
          ...translations,
        }),
      ) as LocalizationRecord[];

      const blob = await this.exportToExcel(localizationRecords);
      this.downloadFile(blob, 'localizations.xlsx');
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Download file with given content
   */
  private downloadFile(content: Blob, filename: string): void {
    try {
      const downloadLink = document.createElement('a');
      const url = window.URL.createObjectURL(content);

      downloadLink.href = url;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';

      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Clean up
      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(url);
      }, FILE_PROCESSING.DOWNLOAD_CLEANUP_DELAY);
    } catch (error) {
      const appError = new FileProcessingError(
        `Failed to download file: ${filename}`,
        filename,
        {context: {originalError: error}},
      );
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Group localizations by locale
   */
  public groupByLocale(
    localizations: LocalizationRecord[],
  ): Record<string, Record<string, string>> {
    try {
      const localeGroups: Record<string, Record<string, string>> = {};

      localizations.forEach((entry) => {
        if (!entry.key) {
          throw new ValidationError(
            'Localization entry missing required key field',
          );
        }

        const {key, ...translations} = entry;

        Object.entries(translations).forEach(([locale, value]) => {
          if (!localeGroups[locale]) {
            localeGroups[locale] = {};
          }
          localeGroups[locale][key] = value || '';
        });
      });

      return localeGroups;
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  public groupLocalizationsByLocale(
    localizations: {key: string; [locale: string]: string}[],
  ): Record<string, Record<string, string>> {
    return this.groupByLocale(localizations as LocalizationRecord[]);
  }

  /**
   * Creates a zip file containing JSON localization files for each locale.
   */
  private async createLocalizationZip(
    localeGroups: Record<string, Record<string, string>>,
  ): Promise<Blob> {
    try {
      const zip = new JSZip();

      if (Object.keys(localeGroups).length === 0) {
        throw new ValidationError(
          'No localization data provided for ZIP creation',
        );
      }

      Object.entries(localeGroups).forEach(([locale, translations]) => {
        if (!locale || typeof locale !== 'string') {
          throw new ValidationError(`Invalid locale code: ${locale}`);
        }

        const jsonContent = JSON.stringify(translations, null, 2);
        zip.file(`${locale}.json`, jsonContent);
      });

      return await zip.generateAsync({type: 'blob'});
    } catch (error) {
      const appError = new FileProcessingError(
        'Failed to create localization ZIP file',
        'localizations.zip',
        {context: {originalError: error}},
      );
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Triggers download of the zip file.
   */
  private async downloadZipFile(zipBlob: Blob): Promise<void> {
    try {
      this.downloadFile(zipBlob, 'localizations.zip');
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Generate and download localization files as ZIP
   */
  public async generateAndDownloadLocalizationZip(
    localizations: LocalizationRecord[],
  ): Promise<void> {
    try {
      if (!localizations || localizations.length === 0) {
        throw new ValidationError('No localization data provided');
      }

      const localeGroups = this.groupByLocale(localizations);
      const zipBlob = await this.createLocalizationZip(localeGroups);
      await this.downloadZipFile(zipBlob);
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Import localizations from Excel file
   */
  public async importFromExcel(file: File): Promise<ImportResult> {
    try {
      const supportedFormats =
        FILE_PROCESSING.SUPPORTED_EXCEL_FORMATS.join(', ');
      if (
        !file ||
        !FILE_PROCESSING.SUPPORTED_EXCEL_FORMATS.some((format) =>
          file.name.toLowerCase().endsWith(format),
        )
      ) {
        throw new ValidationError(
          `Invalid file format. Please provide an Excel file (${supportedFormats})`,
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, {type: 'array'});

      if (workbook.SheetNames.length === 0) {
        throw new FileProcessingError(
          'Excel file contains no worksheets',
          file.name,
        );
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      jsonData.forEach((row, index) => {
        try {
          if (!row.key || typeof row.key !== 'string') {
            errors.push(`Row ${index + 2}: Missing or invalid key`);
            skipped++;
            return;
          }
          imported++;
        } catch (error) {
          errors.push(
            `Row ${index + 2}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
          skipped++;
        }
      });

      return {
        success: errors.length === 0,
        imported,
        skipped,
        errors,
        warnings,
      };
    } catch (error) {
      const appError = new FileProcessingError(
        `Failed to import Excel file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        file.name,
        {context: {originalError: error}},
      );
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Import localizations from JSON files
   */
  public async importFromJson(files: FileList): Promise<ImportResult> {
    try {
      let imported = 0;
      let skipped = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.name.endsWith('.json')) {
          warnings.push(`Skipped non-JSON file: ${file.name}`);
          skipped++;
          continue;
        }

        try {
          const content = await file.text();
          const jsonData = JSON.parse(content);

          if (typeof jsonData !== 'object' || jsonData === null) {
            errors.push(`Invalid JSON structure in file: ${file.name}`);
            skipped++;
            continue;
          }

          imported++;
        } catch (error) {
          errors.push(
            `Failed to process ${file.name}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
          skipped++;
        }
      }

      return {
        success: errors.length === 0,
        imported,
        skipped,
        errors,
        warnings,
      };
    } catch (error) {
      const appError = new FileProcessingError(
        'Failed to import JSON files',
        undefined,
        {context: {originalError: error}},
      );
      ErrorHandler.log(appError);
      throw appError;
    }
  }

  /**
   * Validate localization data
   */
  public async validateLocalizations(
    localizations: LocalizationRecord[],
  ): Promise<ValidationResult> {
    try {
      const errors: Array<{
        key: string;
        message: string;
        severity: 'error' | 'warning';
      }> = [];
      const warnings: Array<{key: string; message: string}> = [];

      const seenKeys = new Set<string>();

      localizations.forEach((record, index) => {
        const recordKey = record.key || `record-${index}`;

        // Check for required key field
        if (
          !record.key ||
          typeof record.key !== 'string' ||
          record.key.trim() === ''
        ) {
          errors.push({
            key: recordKey,
            message: 'Missing or empty key field',
            severity: 'error',
          });
        }

        // Check for duplicate keys
        if (record.key && seenKeys.has(record.key)) {
          errors.push({
            key: record.key,
            message: 'Duplicate key found',
            severity: 'error',
          });
        } else if (record.key) {
          seenKeys.add(record.key);
        }

        // Check for empty translations
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {key, ...translations} = record;
        const translationValues = Object.values(translations);

        if (translationValues.length === 0) {
          warnings.push({
            key: recordKey,
            message: 'No translations provided',
          });
        } else {
          const emptyTranslations = Object.entries(translations)
            .filter(([, value]) => !value || value.trim() === '')
            .map(([locale]) => locale);

          if (emptyTranslations.length > 0) {
            warnings.push({
              key: recordKey,
              message: `Empty translations for locales: ${emptyTranslations.join(
                ', ',
              )}`,
            });
          }
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      const appError = ErrorHandler.normalize(error);
      ErrorHandler.log(appError);
      throw appError;
    }
  }
}
