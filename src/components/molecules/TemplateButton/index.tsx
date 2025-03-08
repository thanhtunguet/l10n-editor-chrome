import {DownloadOutlined} from '@ant-design/icons';
import {Button} from 'antd';

export default function TemplateButton() {
  return (
    <>
      <a
        id="editor-template"
        href="../../../src/assets/l10n-template.xlsx"
        className="hide"
      />
      <Button
        icon={<DownloadOutlined />}
        type="default"
        className="mx-1"
        onClick={() => {
          document.getElementById('editor-template')?.click();
        }}>
        Template
      </Button>
    </>
  );
}
