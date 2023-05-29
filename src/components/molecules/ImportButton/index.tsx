import type {PropsWithChildren, ReactElement} from 'react';
import React from 'react';
import type {ButtonProps} from 'antd/lib/button';
import Button from 'antd/lib/button';
import {ImportOutlined} from '@ant-design/icons';
import * as XLSX from 'xlsx';
import {editorSlice} from 'src/store/slices/editor-slice';
import {useDispatch} from 'react-redux';

function readFileAsBase64(file) {
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

export function ImportButton(
  props: PropsWithChildren<ImportButtonProps>,
): ReactElement {
  const {children} = props;
  const dispatch = useDispatch();

  const handleImportExcel = React.useCallback(
    async (event) => {
      if (event.target.files.length > 0) {
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
        dispatch(
          editorSlice.actions.loadEditor({
            supportedLocales,
            resources,
          }),
        );
      }
    },
    [dispatch],
  );

  return (
    <>
      <Button
        type="primary"
        className="d-flex align-items-center ml-2"
        icon={<ImportOutlined />}
        onClick={() => {
          document.getElementById('import-excel').click();
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

export interface ImportButtonProps extends ButtonProps {}

ImportButton.defaultProps = {
  children: 'Import',
};

ImportButton.displayName = 'ImportButton';

export default ImportButton;
