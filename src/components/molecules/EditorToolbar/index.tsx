import {
  CodeOutlined,
  DownloadOutlined,
  OpenAIOutlined,
} from '@ant-design/icons';
import {Button, Select} from 'antd';
import type {LocalizationRecord} from '../../../models/localization-record';
import CodeModal from '../../organisms/CodeModal';
import NewKeyFormModal from '../../organisms/NewKeyFormModal';
import NewLocaleFormModal from '../../organisms/NewLocaleFormModal';
import ImportButton from '../ImportButton';
import TemplateButton from '../TemplateButton';

interface EditorToolbarProps {
  /**
   * Available namespaces for filtering
   */
  searchableNamespaces: string[];

  /**
   * Currently selected namespace filter
   */
  filteredNamespace: string;

  /**
   * Search value for namespace dropdown
   */
  searchValue: string;

  /**
   * Supported locale codes
   */
  supportedLocales: string[];

  /**
   * Filtered localization records to display
   */
  filteredLocales: LocalizationRecord[];

  /**
   * All localization records for download
   */
  allLocales: LocalizationRecord[];

  /**
   * Callback when namespace filter changes
   */
  onNamespaceChange: (value: string) => void;

  /**
   * Callback when search value changes
   */
  onSearchChange: (value: string) => void;

  /**
   * Callback when import is triggered
   */
  onImport: (
    supportedLocales: string[],
    resources: Record<string, any>,
  ) => void;

  /**
   * Callback when download is triggered
   */
  onDownload: (locales: LocalizationRecord[]) => void;

  /**
   * Callback when AI translation is triggered
   */
  onAITranslateAll: () => void;

  /**
   * Callback when new locale is added
   */
  onAddLanguage: (languageKey: string) => void;

  /**
   * Callback when new key is created
   */
  onCreateNewKey: (key: string) => void;
}

/**
 * Toolbar component for the localization editor
 */
export function EditorToolbar({
  searchableNamespaces,
  filteredNamespace,
  searchValue,
  supportedLocales,
  filteredLocales,
  allLocales,
  onNamespaceChange,
  onSearchChange,
  onImport,
  onDownload,
  onAITranslateAll,
  onAddLanguage,
  onCreateNewKey,
}: EditorToolbarProps) {
  const selectNamespaceComponent = searchableNamespaces.length > 0 && (
    <Select
      allowClear={true}
      className="w-100 flex-grow-1"
      placeholder="Select namespace"
      aria-placeholder="Select namespace"
      showSearch={true}
      searchValue={searchValue ?? ''}
      onSearch={onSearchChange}
      value={filteredNamespace}
      onChange={onNamespaceChange}>
      {searchableNamespaces.map((namespace) => (
        <Select.Option key={namespace} value={namespace}>
          {namespace}
        </Select.Option>
      ))}
    </Select>
  );

  return (
    <div className="d-flex justify-content-end my-4">
      {selectNamespaceComponent}

      <div className="d-inline-flex justify-content-end">
        <ImportButton onImport={onImport}>Import</ImportButton>

        <TemplateButton />

        <CodeModal
          label="Code"
          icon={<CodeOutlined />}
          supportedLocales={supportedLocales}
          localization={filteredLocales}>
          {selectNamespaceComponent}
        </CodeModal>

        <Button
          type="dashed"
          icon={<DownloadOutlined />}
          onClick={() => onDownload(allLocales)}>
          Download
        </Button>

        <Button
          className="mx-1"
          type="primary"
          icon={<OpenAIOutlined />}
          onClick={onAITranslateAll}>
          AI
        </Button>

        <NewLocaleFormModal onAddLanguage={onAddLanguage}>
          Locale
        </NewLocaleFormModal>

        <NewKeyFormModal onCreate={onCreateNewKey}>Key</NewKeyFormModal>
      </div>
    </div>
  );
}

export default EditorToolbar;
