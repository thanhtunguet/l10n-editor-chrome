import {
  CodeOutlined,
  OpenAIOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type {TableProps} from 'antd';
import {Button, Form, Input, Modal, Select, Spin, Table} from 'antd';
import React from 'react';
import ImportButton from 'src/components/molecules/ImportButton';
import TemplateButton from 'src/components/molecules/TemplateButton';
import CodeModal from 'src/components/organisms/CodeModal';
import NewKeyFormModal from 'src/components/organisms/NewKeyFormModal';
import type {LocalizationRecord} from 'src/models/localization-record';
import {useLocalizations} from 'src/services/use-localizations';
import AITranslationModal from './AISupportModal';
import {useAiSuggestion} from 'src/services/use-ai-suggestion';

export default function EditorPage() {
  const {
    locales,
    supportedLocales,
    handlePutLocalizations,
    handleChange,
    handleCreateNewKey,
    handleAddLanguage,
    searchableNamespaces,
  } = useLocalizations();

  const [filteredNamespace, setFilteredNamespace] = React.useState<string>('');
  const [searchValue, setSearchValue] = React.useState<string>('');

  const [aiModalVisible, setAiModalVisible] = React.useState<boolean>(false);

  const handleCloseAiModal = React.useCallback(() => {
    setAiModalVisible(false);
  }, []);

  const {handleGetAiSuggestion} = useAiSuggestion();

  const [translating, setTranslating] = React.useState<boolean>(false);

  const [translateTitle, setTranslateTitle] = React.useState<string>('');

  const handleTranslate = React.useCallback(
    async (record: LocalizationRecord) => {
      const translation = await handleGetAiSuggestion(record);
      Object.assign(record, translation);
      handleChange(record.key, record);
    },
    [handleGetAiSuggestion, handleChange],
  );

  const handleTranslateAll = React.useCallback(async () => {
    setTranslating(true);
    setTranslateTitle('Translating');
    try {
      for (const locale of locales) {
        setTranslateTitle(`Translating ${locale.key}`);
        await handleTranslate(locale);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setTranslating(false);
      setTranslateTitle('');
    }
  }, [locales, handleTranslate]);

  const [newLanguageVisible, setNewLanguageVisible] =
    React.useState<boolean>(false);

  const [newLanguageKey, setNewLanguageKey] = React.useState<string>('');

  const handleOpenNewLanguageModal = React.useCallback(() => {
    setNewLanguageVisible(true);
  }, []);

  const handleCloseNewLanguageModal = React.useCallback(() => {
    setNewLanguageVisible(false);
  }, []);

  return (
    <>
      <div className="d-flex justify-content-end my-4">
        {locales.length > 0 && (
          <Select
            allowClear={true}
            className="w-100 flex-grow-1"
            placeholder="Select namespace"
            showSearch={true}
            searchValue={searchValue}
            onSearch={(searchValue) => {
              setSearchValue(searchValue);
            }}
            value={filteredNamespace}
            onChange={(value) => {
              setFilteredNamespace(value);
            }}>
            {searchableNamespaces.map((namespace) => (
              <Select.Option key={namespace} value={namespace}>
                {namespace}
              </Select.Option>
            ))}
          </Select>
        )}

        <div className="d-inline-flex justify-content-end">
          <ImportButton
            onImport={(supportedLocales, resources) => {
              handlePutLocalizations(
                supportedLocales,
                Object.values(resources),
              );
            }}>
            Import
          </ImportButton>
          <TemplateButton />
          <CodeModal
            label="Code"
            icon={<CodeOutlined />}
            supportedLocales={supportedLocales}
            localization={locales}
          />
          <Button
            className="mx-1"
            type="primary"
            icon={<SettingOutlined />}
            onClick={() => setAiModalVisible(true)}>
            AI Settings
          </Button>
          <Button
            className="mx-1"
            type="primary"
            icon={<OpenAIOutlined />}
            onClick={handleTranslateAll}>
            AI
          </Button>
          <Button
            className="mx-1"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenNewLanguageModal}>
            Add Language
          </Button>
          <NewKeyFormModal onCreate={handleCreateNewKey}>
            Add key
          </NewKeyFormModal>
        </div>
      </div>
      <Spin spinning={translating} tip={translateTitle}>
        <VirtualScrollTable
          virtual={true}
          scroll={{
            y: 800,
          }}
          rowKey={(record) => record.key}
          dataSource={
            filteredNamespace
              ? locales.filter((locale) =>
                  locale.key.startsWith(filteredNamespace),
                )
              : locales
          }
          pagination={false}
          columns={[
            {
              key: 'key',
              dataIndex: 'key',
              title: 'Key',
            },
            ...supportedLocales.map((lang) => ({
              key: lang,
              dataIndex: lang,
              title: lang.toUpperCase(),
              render(locale: string, record: LocalizationRecord) {
                return (
                  <Input
                    value={locale}
                    onChange={(event) => {
                      record[lang] = event.target.value;
                      handleChange(record.key, record);
                    }}
                  />
                );
              },
            })),
            {
              key: 'actions',
              dataIndex: 'key',
              title: 'Actions',
              width: 180,
              render(key: string, record: LocalizationRecord) {
                return (
                  <>
                    <Button
                      type="link"
                      htmlType="button"
                      id={`btn-edit-${key}`}
                      onClick={async () => {
                        await handleTranslate(record);
                      }}>
                      AI
                    </Button>
                    <Button
                      className="text-danger"
                      type="link"
                      htmlType="button"
                      id={`btn-edit-${key}`}>
                      Delete
                    </Button>
                  </>
                );
              },
            },
          ]}
        />
      </Spin>
      <AITranslationModal
        languages={supportedLocales}
        open={aiModalVisible}
        onCloseModal={handleCloseAiModal}
        onClose={handleCloseAiModal}
        onCancel={handleCloseAiModal}
      />
      <Modal
        title="Add new language"
        open={newLanguageVisible}
        onClose={handleCloseNewLanguageModal}
        onCancel={handleCloseNewLanguageModal}
        onOk={() => {
          handleAddLanguage(newLanguageKey);
          handleCloseNewLanguageModal();
        }}>
        <Form>
          <Form.Item label="Language Key">
            <Input
              maxLength={2}
              placeholder="2-chars language key"
              onChange={(event) => {
                setNewLanguageKey(event.target.value);
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function VirtualScrollTable<T>(props: TableProps<T>) {
  const {columns, dataSource, ...restProps} = props;
  const [tableHeight, setTableHeight] = React.useState<number>(400);

  // Function to calculate available height
  const updateTableHeight = () => {
    const headerHeight = 64; // Navbar/Header height (adjust if needed)
    const footerHeight = 0; // Footer height (adjust if needed)
    const padding = 24 * 2 + (22 + 24) + (32 + 24 * 2) + 55; // Any additional padding
    const availableHeight =
      window.innerHeight - headerHeight - footerHeight - padding;
    setTableHeight(availableHeight);
  };

  React.useEffect(() => {
    updateTableHeight();
    window.addEventListener('resize', updateTableHeight);
    return () => window.removeEventListener('resize', updateTableHeight);
  }, []);

  return (
    <Table
      {...restProps}
      columns={columns}
      dataSource={dataSource}
      scroll={{y: tableHeight}}
      virtual={true} // Enable virtual scroll
      pagination={false} // Optional: Remove pagination for better virtual scroll effect
    />
  );
}
