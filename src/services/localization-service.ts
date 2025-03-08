import * as XLSX from 'xlsx';

import JSZip from 'jszip';

export class LocalizationService {
  public exportToLocalizationsExcel(
    localizations: Record<string, Record<string, string>>,
  ): void {
    const workbook = XLSX.utils.book_new();
    const json = Object.values(localizations).map(
      (record: Record<string, string>) => {
        return Object.fromEntries(
          Object.entries(record).map(([k, v]) => {
            return [k, v];
          }),
        );
      },
    );
    const worksheet = XLSX.utils.json_to_sheet(json);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'data');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });
    const fileName = 'localizations.xlsx';

    this.saveAsExcelBuffer(excelBuffer, fileName);
  }

  public saveAsExcelBuffer(buffer: ArrayBuffer, fileName: string): void {
    const data = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // For other browsers
    const downloadLink = document.createElement('a');
    const url = window.URL.createObjectURL(data);

    downloadLink.href = url;
    downloadLink.download = fileName;

    document.body.appendChild(downloadLink);
    downloadLink.click();

    setTimeout(() => {
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  /**
   * Groups the localization entries by locale code.
   *
   * @param localizations - Array of localization objects.
   * @returns Dictionary where keys are locale codes and values are translation objects.
   */
  public groupLocalizationsByLocale(
    localizations: {key: string; [locale: string]: string}[],
  ) {
    const localeGroups: Record<string, Record<string, string>> = {};

    localizations.forEach((entry) => {
      const key = entry.key;
      Object.keys(entry).forEach((locale) => {
        if (locale === 'key') {
          return;
        }
        if (!localeGroups[locale]) {
          localeGroups[locale] = {};
        }
        localeGroups[locale][key] = entry[locale];
      });
    });

    return localeGroups;
  }

  /**
   * Creates a zip file containing JSON localization files for each locale.
   *
   * @param localeGroups - Grouped localization data.
   * @returns A Promise resolving to the zip file blob.
   */
  public async createLocalizationZip(
    localeGroups: Record<string, Record<string, string>>,
  ) {
    const zip = new JSZip();

    Object.entries(localeGroups).forEach(([locale, translations]) => {
      const jsonContent = JSON.stringify(translations, null, 2);
      zip.file(`${locale}.json`, jsonContent);
    });

    return zip.generateAsync({type: 'blob'});
  }

  /**
   * Triggers download of the zip file.
   *
   * @param zipBlob - The zip file blob.
   */
  public async downloadZipFile(zipBlob: Blob) {
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'localizations.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Main function to process localization data and download the zip file.
   *
   * @param localizations - Array of localization objects.
   */
  public async generateAndDownloadLocalizationZip(
    localizations: {key: string; [locale: string]: string}[],
  ) {
    const localeGroups = this.groupLocalizationsByLocale(localizations);
    const zipBlob = await this.createLocalizationZip(localeGroups);
    this.downloadZipFile(zipBlob);
  }
}
