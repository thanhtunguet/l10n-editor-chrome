import {Button, Input, Table} from 'antd';
import ImportButton from 'src/components/molecules/ImportButton';
import TemplateButton from 'src/components/molecules/TemplateButton';
import CodeModal from 'src/components/organisms/CodeModal';
import NewKeyFormModal from 'src/components/organisms/NewKeyFormModal';
import type {LocalizationRecord} from 'src/models/localization-record';
import {useLocalizations} from 'src/services/use-localizations';

export default function EditorPage() {
  const {
    locales,
    supportedLocales,
    handlePutLocalizations,
    handleChange,
    handleCreateNewKey,
  } = useLocalizations();

  return (
    <>
      <div className="d-flex justify-content-end my-4">
        <ImportButton
          onImport={(supportedLocales, resources) => {
            handlePutLocalizations(supportedLocales, Object.values(resources));
          }}>
          Import
        </ImportButton>
        <TemplateButton />
        <CodeModal
          label="Code"
          supportedLocales={supportedLocales}
          localization={locales}
        />
        <NewKeyFormModal onCreate={handleCreateNewKey}>Add key</NewKeyFormModal>
      </div>
      <Table
        dataSource={locales}
        pagination={false}
        columns={[
          {
            key: 'key',
            dataIndex: 'key',
            title: 'Key',
          },
          {
            key: 'vi',
            dataIndex: 'vi',
            title: 'Vietnamese',
            render(vi: string, record: LocalizationRecord) {
              return (
                <Input
                  value={vi}
                  onChange={(event) => {
                    record.vi = event.target.value;
                    handleChange(record.key, record);
                  }}
                />
              );
            },
          },
          {
            key: 'en',
            dataIndex: 'en',
            title: 'English',
            render(en: string, record: LocalizationRecord) {
              return (
                <Input
                  value={en}
                  onChange={(event) => {
                    record.en = event.target.value;
                    handleChange(record.key, record);
                  }}
                />
              );
            },
          },
          {
            key: 'key',
            dataIndex: 'key',
            title: 'Actions',
            width: 100,
            render(key: string) {
              return (
                <Button
                  className="text-danger"
                  type="link"
                  htmlType="button"
                  id={`btn-edit-${key}`}>
                  Delete
                </Button>
              );
            },
          },
        ]}
      />
    </>
  );
}
