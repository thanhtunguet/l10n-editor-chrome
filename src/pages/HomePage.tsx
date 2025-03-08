import {Button, Form, Input, notification} from 'antd';
import React from 'react';
import type {ExtensionSettings} from 'src/models/extension-settings';

export const EXTENSION_SETTINGS_KEY = 'extensionSettings';

const HomePage = () => {
  const [form] = Form.useForm<ExtensionSettings>();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    chrome.storage.sync.get(EXTENSION_SETTINGS_KEY).then((result) => {
      form.setFieldsValue(result.extensionSettings);
    });
  }, [form]);

  const onFinish = React.useCallback(async (values: ExtensionSettings) => {
    setIsLoading(true);
    await chrome.storage.sync.set({extensionSettings: values}).then(() => {
      setIsLoading(false);
    });
    notification.success({
      message: 'Settings saved!',
      description: 'Your extension settings have been saved.',
    });
  }, []);

  return (
    <Form
      className="mx-4 my-4"
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        reactPath: '/src/i18n',
        flutterPath: '/lib/l10n',
      }}>
      {/* Figma API Key */}
      <Form.Item
        label="Figma API Key"
        help="You can find your Figma API key in the Figma account settings"
        name="figmaApiKey"
        rules={[{required: true, message: 'Please enter your Figma API Key'}]}>
        <Input placeholder="Enter your Figma API Key" />
      </Form.Item>

      {/* Default React Path */}
      <Form.Item
        label="Default React Path"
        help="The default path where React localization files are stored"
        name="reactPath"
        rules={[
          {required: true, message: 'Please enter the default React path'},
        ]}>
        <Input placeholder="e.g., /src/i18n" />
      </Form.Item>

      {/* Default Flutter Path */}
      <Form.Item
        label="Default Flutter Path"
        help="The default path where Flutter localization files are stored"
        name="flutterPath"
        rules={[
          {required: true, message: 'Please enter the default Flutter path'},
        ]}>
        <Input placeholder="e.g., /lib/l10n" />
      </Form.Item>

      {/* Submit Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Save Settings
        </Button>

        <Button
          type="default"
          className="mx-2"
          htmlType="button"
          onClick={() => {
            chrome.runtime.openOptionsPage();
          }}>
          Options
        </Button>
      </Form.Item>
    </Form>
  );
};

export default HomePage;
