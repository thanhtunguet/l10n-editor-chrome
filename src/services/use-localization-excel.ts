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

export function useLocalizationExcel(
  onImport: (
    supportedLocales: string[],
    resources: Record<string, LocalizationRecord>,
  ) => void,
): {
  handleImportExcel: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
} {
  const handleImportExcel = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.length) {
        const file = event.target.files[0];
        const base64 = await readFileAsBase64(file);
        const workbook = XLSX.read(base64, {type: 'base64'});
        const json = XLSX.utils.sheet_to_json(
          Object.values(workbook.Sheets)[0],
        );
        const supportedLocales = Object.keys(json[0]).filter(
          (key) => key !== 'key',
        );
        const resources = Object.fromEntries(
          json.map((record: any) => [record.key, record]),
        );
        onImport(supportedLocales, resources);
      }
    },
    [onImport],
  );

  return {
    handleImportExcel,
  };
}
