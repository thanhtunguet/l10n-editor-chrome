import {notification} from 'antd';
import React from 'react';
import type {LocalizationRecord} from 'src/models/localization-record';
import * as XLSX from 'xlsx';

function readFileAsBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
        return;
      }
      reject();
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsDataURL(file);
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject();
    };

    reader.onerror = () => {
      reject(new Error('Failed to read the file'));
    };

    reader.readAsText(file);
  });
}

function arrayFromFileList(fileList: FileList | null): File[] {
  if (!fileList) {
    return [];
  }
  return Array.from(fileList);
}

function isExcelFile(file: File) {
  return file.name.endsWith('xls') || file.name.endsWith('xlsx');
}

function isJsonFiles(fileList: File[]) {
  return fileList.every((file) => file.name.endsWith('.json'));
}

export function useLocalizationExcel(
  onImport: (
    supportedLocales: string[],
    resources: Record<string, LocalizationRecord>,
  ) => void,
): {
  handleImportFiles: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
} {
  const handleImportExcel = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = arrayFromFileList(event.target.files);

      // check if all files are json files
      if (isJsonFiles(files)) {
        const texts = await Promise.all(files.map(readFileAsText));
        const jsons = texts.map((text) => JSON.parse(text));
        const supportedLocales: string[] = files.map(
          (file) => file.name.split('.')[0],
        );
        const resources = Object.keys(jsons[0]).map((key) => {
          const records = Object.fromEntries(
            supportedLocales.map((locale, index) => {
              return [[locale], jsons[index][key]];
            }),
          );
          return [
            key,
            {
              key,
              ...records,
            },
          ];
        });
        onImport(supportedLocales, Object.fromEntries(resources));
        return;
      }

      if (files.length === 1) {
        const file = files[0];
        if (isExcelFile(file)) {
          const base64 = await readFileAsBase64(file);
          const workbook = XLSX.read(base64, {type: 'base64'});
          const json: Record<string, string>[] = XLSX.utils.sheet_to_json(
            Object.values(workbook.Sheets)[0],
          );
          const supportedLocales = Object.keys(json[0]).filter(
            (key) => key !== 'key',
          );
          const resources = Object.fromEntries(
            json.map((record: any) => [record.key, record]),
          );
          onImport(supportedLocales, resources);
          return;
        }

        notification.error({
          message: 'Invalid file type',
          description:
            'Please upload ONE valid Excel file or MULTIPLE JSON files',
        });
      }
    },
    [onImport],
  );

  return {
    handleImportFiles: handleImportExcel,
  };
}
