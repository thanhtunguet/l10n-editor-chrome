import type {FC} from 'react';
import React from 'react';
import type {ColumnProps} from 'antd/lib/table';
import Table from 'antd/lib/table';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import {
  CloseOutlined,
  CodepenOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ExportOutlined,
  ImportOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {useDispatch, useSelector} from 'react-redux';
import type {GlobalState} from 'src/store/GlobalState';
import {editorSlice} from 'src/store/slices/editor-slice';
import * as XLSX from 'xlsx';
import './Editor.scss';
import CodeModal from 'src/components/organisms/CodeModal';
import NewKeyFormModal from 'src/components/organisms/NewKeyFormModal';
import {exportToLocalizationsExcel} from 'src/helpers/excel';
import {edit} from 'ace-builds';

const Editor: FC = () => {
  const [files, setFiles] = React.useState<FileList | undefined>();

  const locales = useSelector(
    (state: GlobalState) => state.editor.supportedLocales,
  );

  const localizationData = useSelector(
    (state: GlobalState) => state.editor.resources,
  );

  const dispatch = useDispatch();

  const handleLoadLanguages = React.useCallback(
    async (selectedFileList: FileList) => {
      const result = {};
      const languages: string[] = [];
      for (let i = 0; i < selectedFileList.length; i++) {
        const file = selectedFileList[i];
        const locale = file.name.match(/([A-Za-z]{2})\.(arb|json)$/)[1];
        languages.push(locale);
        const text = await file.text();
        const json = JSON.parse(text);
        Object.entries(json).forEach(([key, value]) => {
          if (!result.hasOwnProperty(key)) {
            result[key] = {};
          }
          result[key].key = key;
          result[key][locale] = value;
        });
      }
      dispatch(
        editorSlice.actions.loadEditor({
          supportedLocales: languages,
          resources: result,
        }),
      );
    },
    [dispatch],
  );

  React.useEffect(() => {
    if (files?.length > 0) {
      handleLoadLanguages(files!).then();
    }
  }, [files, handleLoadLanguages]);

  const columns: ColumnProps<any>[] = React.useMemo((): ColumnProps<any>[] => {
    if (Object.keys(localizationData).length === 0) {
      return [];
    }
    return [
      ...Object.keys(Object.values(localizationData)[0]).map((key) => ({
        dataIndex: key,
        key: key,
        title: key,
        render: (value, record) => {
          if (key !== 'key') {
            return (
              <Input
                value={value}
                disabled={value === key}
                onChange={(event) => {
                  dispatch(
                    editorSlice.actions.setNewKey({
                      language: key,
                      key: record.key,
                      value: event.target.value,
                    }),
                  );
                }}
              />
            );
          }
          return value;
        },
      })),
      {
        dataIndex: 'key',
        key: 'actions',
        title: 'Actions',
        width: 120,
        className: 'd-flex justify-content-center align-items-center',
        render: (key) => {
          return (
            <Button
              type="link"
              icon={<DeleteOutlined className="text-danger" />}
              onClick={() => {
                if (key !== '@@locale') {
                  dispatch(editorSlice.actions.deleteKey(key));
                }
              }}
            />
          );
        },
      },
    ];
  }, [dispatch, localizationData]);

  const localizations = React.useMemo(
    () => Object.values(localizationData),
    [localizationData],
  );

  const handleExportExcel = React.useCallback(() => {
    exportToLocalizationsExcel(localizationData);
  }, [localizationData]);

  const handleImportExcel = React.useCallback(
    async (event) => {
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

  if (columns.length === 0) {
    return (
      <div className="p-4">
        <input
          type="file"
          // @ts-ignore
          webkitdirectory="webkitdirectory"
          className="btn btn-default"
          multiple={true}
          onChange={(event) => {
            setFiles(event.target.files);
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex my-2">
        <Button
          type="default"
          className="d-flex align-items-center mr-2"
          icon={<CloseOutlined />}
          onClick={() => {
            dispatch(editorSlice.actions.cancelEditor());
          }}>
          Close editor
        </Button>

        <div className="d-inline-flex flex-grow-1 justify-content-end">
          <a
            role="button"
            href="../../assets/l10n-template.xlsx"
            className="ant-btn ant-btn-primary d-flex align-items-center ml-2">
            <DownloadOutlined />
            <span className="ml-2">Download template</span>
          </a>

          <NewKeyFormModal icon={<PlusOutlined />}>Add key</NewKeyFormModal>

          <Button
            type="primary"
            className="d-flex align-items-center ml-2"
            icon={<ImportOutlined />}
            onClick={() => {
              document.getElementById('import-excel').click();
            }}>
            Import
          </Button>

          <input
            type="file"
            id="import-excel"
            onChange={handleImportExcel}
            className="hide"
          />

          <Button
            type="primary"
            className="d-flex align-items-center ml-2"
            icon={<ExportOutlined />}
            onClick={handleExportExcel}>
            Export
          </Button>

          <CodeModal
            label="Code"
            locales={locales}
            localization={localizationData}
            icon={<CodepenOutlined />}
          />
        </div>
      </div>

      <Table columns={columns} dataSource={localizations} pagination={false} />
    </>
  );
};

Editor.displayName = 'Editor';

export default Editor;
