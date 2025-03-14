import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import {Col, Form, Row, Switch} from 'antd';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal/Modal';
import Typography from 'antd/lib/typography';
import type {PropsWithChildren, ReactElement} from 'react';
import React from 'react';
import AceEditor from 'react-ace';
import type {LocalizationRecord} from 'src/models/localization-record';

function downloadFile(filename: string, content: string): void {
  const blob = new Blob([content], {type: 'text/plain'});

  const anchorElement = document.createElement('a');
  anchorElement.href = URL.createObjectURL(blob);
  anchorElement.download = filename;
  anchorElement.style.display = 'none';

  document.body.appendChild(anchorElement);
  anchorElement.click();

  document.body.removeChild(anchorElement);
  URL.revokeObjectURL(anchorElement.href);
}

/**
 * Sorts an object by its keys in ascending order.
 *
 * @param obj - The object to be sorted
 * @returns A new object with sorted keys
 */
const sortObjectByKey = <T extends Record<string, any>>(obj: T): T => {
  return Object.keys(obj)
    .sort() // Sort keys alphabetically
    .reduce((sortedObj, key) => {
      sortedObj[key] = obj[key];
      return sortedObj;
    }, {} as T);
};

const compareFunction = ([key1]: [string, string], [key2]: [string, string]) =>
  key1 > key2;

export function CodeModal(
  props: PropsWithChildren<CodeModalProps>,
): ReactElement {
  const {
    label,
    supportedLocales: locales,
    localization,
    icon,
    children,
  } = props;

  const [displayNamespace, setDisplayNamespace] = React.useState<boolean>(true);

  const [isCodeModalVisible, setIsCodeModalVisible] =
    React.useState<boolean>(false);

  const handleOpenCodeModal = React.useCallback(() => {
    setIsCodeModalVisible(true);
  }, []);

  const handleCloseCodeModal = React.useCallback(() => {
    setIsCodeModalVisible(false);
  }, []);

  return (
    <>
      <Button
        type="primary"
        className="d-flex align-items-center mx-1"
        icon={icon}
        onClick={handleOpenCodeModal}>
        {label}
      </Button>
      <Modal
        open={isCodeModalVisible}
        width={window.innerWidth - 100}
        height={window.innerHeight - 80}
        closable={true}
        centered={true}
        onCancel={handleCloseCodeModal}
        onOk={handleCloseCodeModal}>
        <Row>
          <Col span={12}>
            <Form.Item label="Namespace">{children}</Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Display namespace"
              labelCol={{
                span: 8,
              }}
              wrapperCol={{
                span: 16,
              }}>
              <Switch
                value={displayNamespace}
                onChange={(value) => {
                  setDisplayNamespace(value);
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="p-2 d-flex justify-content-start bg-white">
          {isCodeModalVisible &&
            locales.map((locale) => {
              const result: Record<string, string> = Object.fromEntries(
                Object.entries(localization).map(([, value]) => [
                  value.key,
                  value[locale],
                ]),
              );

              const content = JSON.stringify(
                sortObjectByKey(
                  Object.fromEntries(
                    Object.entries(result).map(
                      ([key, value]: [string, string]): [string, string] => [
                        displayNamespace
                          ? key
                          : key.replace(/^[A-Za-z0-9]+\./gi, ''),
                        value,
                      ],
                    ),
                  ),
                ),
                null,
                2,
              );

              return (
                <div key={locale} className="d-flex flex-column flex-grow-1">
                  <Typography.Title level={2}>{locale}</Typography.Title>

                  <div className="d-flex justify-content-between">
                    <Button
                      type="link"
                      onClick={() => {
                        downloadFile(`${locale}.json`, content);
                      }}>
                      Download
                      <code>{` ${locale}.json`}</code>
                    </Button>

                    <Button
                      type="link"
                      onClick={() => {
                        downloadFile(`intl_${locale}.arb`, content);
                      }}>
                      Download
                      <code>{` intl_${locale}.arb`}</code>
                    </Button>
                  </div>

                  <div className="flex-grow-1">
                    <AceEditor
                      width="100%"
                      mode="json"
                      theme="monokai"
                      editorProps={{$blockScrolling: true}}
                      value={content}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </Modal>
    </>
  );
}

export interface CodeModalProps {
  supportedLocales: string[];

  localization: LocalizationRecord[];

  label: string;

  icon?: ReactElement;
}

CodeModal.displayName = 'CodeModal';

export default CodeModal;
