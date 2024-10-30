import * as XLSX from 'xlsx';

export class LocalizationService {
  exportToLocalizationsExcel(
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

  saveAsExcelBuffer(buffer: ArrayBuffer, fileName: string): void {
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
}
