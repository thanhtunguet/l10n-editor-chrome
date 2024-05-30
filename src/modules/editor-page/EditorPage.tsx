import {
  CloseOutlined,
  CodepenOutlined,
  DeleteOutlined,
  ExportOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import {captureException} from '@sentry/react';
import Affix from 'antd/lib/affix';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import notification from 'antd/lib/notification';
import Select from 'antd/lib/select';
import type {ColumnProps} from 'antd/lib/table';
import Table from 'antd/lib/table';
import type {FC} from 'react';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {firstValueFrom} from 'rxjs';
import ImportButton from 'src/components/molecules/ImportButton';
import TemplateButton from 'src/components/molecules/TemplateButton';
import CodeModal from 'src/components/organisms/CodeModal';
import NewKeyFormModal from 'src/components/organisms/NewKeyFormModal';
import {exportToLocalizationsExcel} from 'src/helpers/excel';
import {
  getLocaleFromFilename,
  mapLocaleFilesToResources,
} from 'src/helpers/locale';
import {AzureDevopsRepository} from 'src/repositories/azure-devops-repository';
import {store} from 'src/store';
import {
  isOnlineSelector,
  localeSelector,
  resourceSelector,
} from 'src/store/selectors';
import {editorSlice} from 'src/store/slices/editor-slice';
import './EditorPage.scss';
import classnames from 'classnames';
import {debug} from 'console';

const EditorPage: FC = () => {
  const [files, setFiles] = React.useState<FileList | undefined>();

  const locales = useSelector(localeSelector);

  const [search, setSearch] = React.useState<string>('');

  const handleSearch = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    [],
  );

  const isOnline: boolean = useSelector(isOnlineSelector);

  const localizationData = useSelector(resourceSelector);

  const dispatch = useDispatch();

  const handleLoadLanguages = React.useCallback(
    async (selectedFileList: FileList) => {
      const languages: string[] = [];

      const localeObjects = {};

      for (let i = 0; i < selectedFileList.length; i++) {
        const file = selectedFileList[i];
        try {
          const locale = getLocaleFromFilename(file.name);

          if (!languages.includes(locale)) {
            languages.push(locale);
          }
          const text = await file.text();
          if (!localeObjects.hasOwnProperty(locale)) {
            localeObjects[locale] = {};
          }
          const json = JSON.parse(text);
          debugger;
          localeObjects[locale] = {
            ...localeObjects[locale],
            ...json,
          };
        } catch (error) {
          console.error(error);
          debugger;
        }
      }

      dispatch(
        editorSlice.actions.loadEditor({
          supportedLocales: languages,
          resources: mapLocaleFilesToResources(localeObjects),
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
        className: classnames({
          'key-label': key === 'key',
        }),
        render: (value, record) => {
          if (key !== 'key') {
            const onChangeItem = (event) => {
              dispatch(
                editorSlice.actions.setNewKey({
                  language: key,
                  key: record.key,
                  value: event.target.value,
                }),
              );
            };

            return (
              <Input
                defaultValue={value}
                disabled={value === key}
                onPressEnter={onChangeItem}
                onBlur={onChangeItem}
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

  const localizations = React.useMemo(() => {
    if (search) {
      return Object.values(localizationData).filter((obj) =>
        obj.key.startsWith(search),
      );
    }
    return Object.values(localizationData);
  }, [localizationData, search]);

  const filterKeys = React.useMemo(() => {
    const maps = {};
    Object.entries(localizationData).forEach(([key]) => {
      if (key.indexOf('.') > 0) {
        const namespace = key.split('.')[0];
        if (!maps.hasOwnProperty(namespace)) {
          maps[namespace] = true;
        }
      }
    });
    return Object.keys(maps);
  }, [localizationData]);

  const handleExportExcel = React.useCallback(() => {
    exportToLocalizationsExcel(localizationData);
  }, [localizationData]);

  const [api, contextHolder] = notification.useNotification();

  const openNotification = React.useCallback(
    (title: string, description: string) => {
      api.info({
        message: title,
        description: description,
        placement: 'topRight',
      });
    },
    [api],
  );

  const handleSaveToDevops = React.useCallback(async () => {
    const {
      devopsServer,
      repositoryId,
      projectType,
      resources,
      supportedLocales,
    } = store.getState().editor;

    const reverseResources = Object.fromEntries(
      supportedLocales.map((locale) => {
        const filename =
          projectType === 'react'
            ? `/src/i18n/${locale}.json`
            : `/lib/l10n/intl_${locale}.arb`;
        return [
          filename,
          JSON.stringify(
            Object.fromEntries(
              Object.values(resources).map((values) => [
                values.key,
                values[locale],
              ]),
            ),
            null,
            2,
          ),
        ];
      }),
    );

    const azureRepository = new AzureDevopsRepository(devopsServer.url);
    const latestCommitId: string = await firstValueFrom(
      azureRepository.getLatestCommitId(repositoryId),
    );

    azureRepository
      .updateFiles(repositoryId, latestCommitId, reverseResources)
      .subscribe({
        next: () => {
          openNotification(
            'Saved successfully',
            "All language files have been updated to Azure Devops. If you have setup pipelines, you'll get new version soon",
          );
        },
        error: (error) => {
          captureException(error);
          openNotification('Saving failed', 'Saving language files failed');
        },
      });
  }, [openNotification]);

  if (columns.length === 0) {
    return (
      <div className="p-4 d-flex align-items-center">
        <TemplateButton />

        <ImportButton>Import Excel</ImportButton>

        <Button
          type="primary"
          className="mx-2"
          onClick={() => {
            document.getElementById('import-files').click();
          }}>
          Import files
        </Button>

        <input
          id="import-files"
          type="file"
          className="hide"
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
      {contextHolder}
      <Affix>
        <div className="bg-white">
          <div className="d-flex py-2 bg-white">
            <Button
              type="default"
              className="d-flex align-items-center mr-2"
              icon={<CloseOutlined />}
              onClick={() => {
                dispatch(editorSlice.actions.closeEditor());
              }}>
              Close editor
            </Button>

            <div className="d-inline-flex flex-grow-1 justify-content-end">
              <TemplateButton />

              <NewKeyFormModal icon={<PlusOutlined />}>Add key</NewKeyFormModal>

              <ImportButton />

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
                localization={Object.fromEntries(
                  localizations.map((obj) => [obj.key, obj]),
                )}
                icon={<CodepenOutlined />}
              />

              {isOnline && (
                <Button
                  type="primary"
                  className="d-flex align-items-center ml-2"
                  icon={<SaveOutlined />}
                  onClick={handleSaveToDevops}>
                  Save
                </Button>
              )}
            </div>
          </div>
          <Form className="p-4" wrapperCol={{span: 20}} labelCol={{span: 4}}>
            {filterKeys.length === 0 && (
              <Form.Item label="Search key">
                <Input
                  placeholder="Search key"
                  value={search}
                  onChange={handleSearch}
                />
              </Form.Item>
            )}

            {filterKeys.length > 0 && (
              <Form.Item label="Filter key">
                <Select
                  placeholder="Filter key"
                  options={filterKeys.map((key) => ({
                    label: key,
                    value: key,
                  }))}
                  allowClear={true}
                  showSearch={true}
                  value={search ?? undefined}
                  onChange={(event) => {
                    setSearch(event);
                  }}
                />
              </Form.Item>
            )}
          </Form>
        </div>
      </Affix>

      <Table
        columns={columns}
        dataSource={localizations}
        virtual={true}
        scroll={{y: 600}}
        pagination={false}
      />
    </>
  );
};

EditorPage.displayName = '/editor';

export default EditorPage;
