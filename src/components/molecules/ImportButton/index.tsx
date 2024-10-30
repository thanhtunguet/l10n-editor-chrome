import {ImportOutlined} from '@ant-design/icons';
import type {ButtonProps} from 'antd/lib/button';
import Button from 'antd/lib/button';
import type {PropsWithChildren, ReactElement} from 'react';
import type {LocalizationRecord} from 'src/models/localization-record';
import {useLocalizationExcel} from 'src/services/use-localization-excel';

export default function ImportButton(
  props: PropsWithChildren<ImportButtonProps>,
): ReactElement {
  const {children, onImport} = props;

  const {handleImportExcel} = useLocalizationExcel(onImport);

  return (
    <>
      <Button
        type="primary"
        className="d-flex align-items-center mx-1"
        icon={<ImportOutlined />}
        onClick={() => {
          document.getElementById('import-excel')?.click();
        }}>
        {children}
      </Button>

      <input
        type="file"
        id="import-excel"
        onChange={handleImportExcel}
        className="hide"
      />
    </>
  );
}

export interface ImportButtonProps extends ButtonProps {
  onImport: (
    supportedLocales: string[],
    resources: Record<string, LocalizationRecord>,
  ) => void;
}

ImportButton.displayName = 'ImportButton';
