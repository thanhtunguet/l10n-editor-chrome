import {Button, Input, Modal} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import React from 'react';
import {countryCodeMap} from '../../../config/consts';
import type {LocalizationRecord} from '../../../models/localization-record';
import VirtualScrollTable from '../VirtualScrollTable';

interface LocalizationTableProps {
  /**
   * Data source for the table
   */
  dataSource: LocalizationRecord[];

  /**
   * Supported locale codes
   */
  supportedLocales: string[];

  /**
   * Callback when a field value changes
   */
  onChange: (key: string, record: LocalizationRecord) => void;

  /**
   * Callback when AI translation is requested for a single record
   */
  onTranslate: (record: LocalizationRecord) => Promise<void>;

  /**
   * Callback when a key is deleted
   */
  onDeleteKey: (key: string) => void;

  /**
   * Loading state for the table
   */
  loading?: boolean;
}

/**
 * Table component for displaying and editing localizations
 */
export function LocalizationTable({
  dataSource,
  supportedLocales,
  onChange,
  onTranslate,
  onDeleteKey,
  loading = false,
}: LocalizationTableProps) {
  const columns: ColumnsType<LocalizationRecord> = React.useMemo(
    () => [
      {
        key: 'key',
        dataIndex: 'key',
        title: 'Key',
        width: 200,
        fixed: 'left',
        ellipsis: true,
      },
      ...supportedLocales.map((lang) => ({
        key: lang,
        dataIndex: lang,
        title: (
          <>
            {lang.toUpperCase()} ({countryCodeMap[lang] || lang})
          </>
        ),
        width: 250,
        render(locale: string, record: LocalizationRecord) {
          return (
            <Input
              value={locale}
              placeholder={`Enter ${lang} translation`}
              onChange={(event) => {
                const updatedRecord = {...record};
                updatedRecord[lang] = event.target.value;
                onChange(record.key, updatedRecord);
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
        fixed: 'right',
        render(key: string, record: LocalizationRecord) {
          return (
            <div className="d-flex gap-2">
              <Button
                type="link"
                size="small"
                htmlType="button"
                id={`btn-ai-${key}`}
                onClick={async () => {
                  try {
                    await onTranslate(record);
                  } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('Translation failed:', error);
                  }
                }}>
                AI
              </Button>
              <Button
                className="text-danger"
                size="small"
                onClick={() => {
                  Modal.confirm({
                    title: 'Delete this key',
                    content: `Are you sure you want to delete the key "${key}"?`,
                    okType: 'danger',
                    okText: 'Delete',
                    cancelText: 'Cancel',
                    onOk() {
                      onDeleteKey(key);
                    },
                  });
                }}
                type="link"
                htmlType="button"
                id={`btn-delete-${key}`}>
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [supportedLocales, onChange, onTranslate, onDeleteKey],
  );

  return (
    <VirtualScrollTable
      rowKey={(record) => record.key}
      dataSource={dataSource}
      columns={columns}
      loading={loading}
      size="small"
      bordered
    />
  );
}

export default LocalizationTable;
