import {Button, Form, Input, notification} from 'antd';
import React from 'react';
import {OPENAI_DEFAULT_SETTINGS} from 'src/config/consts';
import type {OpenAISettings} from 'src/models/openai-settings';
import useOpenAISettings from 'src/services/use-openai-settings';

export function AISettingsPage() {
  const [form] = Form.useForm<OpenAISettings>();
  const {settings, setOpenAISettings, loading} = useOpenAISettings();

  // Load settings into the form when the modal is opened
  React.useEffect(() => {
    form.setFieldsValue(settings);
  }, [settings, form]);

  // Handle form submission to save settings
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      await setOpenAISettings(values); // Save settings to Chrome storage
      notification.success({
        message: 'Settings saved!',
        description: 'Your OpenAI settings have been saved.',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Validation failed:', error);
    }
  };

  return (
    <Form form={form} layout="vertical" initialValues={OPENAI_DEFAULT_SETTINGS}>
      <Form.Item
        label="OpenAI Base URL"
        help="The base URL for the OpenAI API"
        name="baseUrl">
        <Input placeholder="https://api.openai.com/v1" />
      </Form.Item>
      <Form.Item
        label="OpenAI API Key"
        help="You can find your API key in the OpenAI dashboard"
        name="apiKey">
        <Input.Password placeholder="OpenAI API Key" />
      </Form.Item>
      <Form.Item label="OpenAI Model" name="model" help="The model to use">
        <Input placeholder="Example: gpt-4-turbo, llama3.1, etc." />
      </Form.Item>
      <Form.Item
        label="System Prompt"
        name="systemPrompt"
        help="Instructions for AI translation">
        <Input.TextArea
          rows={form.getFieldValue('systemPrompt')?.split('\n').length}
          placeholder="Custom instructions for AI translation"
        />
      </Form.Item>

      <Button type="primary" block onClick={handleSave} loading={loading}>
        Save Settings
      </Button>
    </Form>
  );
}

// interface AISettingsPageProps {
//   languages: string[];
// }
