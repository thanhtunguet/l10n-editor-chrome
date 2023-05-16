import type {PropsWithChildren, ReactElement} from 'react';
import React from 'react';
import Typography from 'antd/lib/typography';
import AceEditor from 'react-ace';
import Modal from 'antd/lib/modal/Modal';
import type {LocalizationMap} from 'src/types/Localization';
import Button from 'antd/lib/button';

export function CodeModal(
  props: PropsWithChildren<CodeModalProps>,
): ReactElement {
  const {label, locales, localization, icon} = props;

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
        className="d-flex align-items-center ml-2"
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
                Object.entries(localization).map(([key, value]) => [
                  key,
                  value[locale],
                ]),
              );
              return (
                <div
                  key={locale}
                  className="d-flex flex-column justify-content-center">
                  <Typography.Title level={2}>{locale}</Typography.Title>
                  <AceEditor
                    mode="json"
                    theme="monokai"
                    editorProps={{$blockScrolling: true}}
                    value={JSON.stringify(result, null, 2)}
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
  locales: string[];

  localization: LocalizationMap;

  label: string;

  icon?: ReactElement;
}

CodeModal.defaultProps = {
  //
};

CodeModal.displayName = 'CodeModal';

export default CodeModal;
