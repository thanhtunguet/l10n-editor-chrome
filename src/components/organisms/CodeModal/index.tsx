import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
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

export function CodeModal(
  props: PropsWithChildren<CodeModalProps>,
): ReactElement {
  const {label, supportedLocales: locales, localization, icon} = props;

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
        width={locales.length * 500 + 100}
        closable={true}
        onCancel={handleCloseCodeModal}>
        <div className="d-flex p-2">
          {isCodeModalVisible &&
            locales.map((locale) => {
              const result = Object.fromEntries(
                Object.entries(localization).map(([, value]) => [
                  value.key,
                  value[locale],
                ]),
              );

              const content = JSON.stringify(result, null, 2);

              return (
                <div key={locale} className="d-flex flex-column">
                  <Typography.Title level={2}>{locale}</Typography.Title>

                  <div>
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

                  <AceEditor
                    mode="json"
                    theme="monokai"
                    editorProps={{$blockScrolling: true}}
                    value={content}
                  />
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
