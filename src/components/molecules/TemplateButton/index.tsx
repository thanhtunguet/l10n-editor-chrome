import {DownloadOutlined} from '@ant-design/icons';

export default function TemplateButton() {
  return (
    <a
      role="button"
      href="../../../src/assets/l10n-template.xlsx"
      className="ant-btn ant-btn-primary d-flex align-items-center ml-2">
      <DownloadOutlined />
      <span className="ml-2">Download template</span>
    </a>
  );
}
