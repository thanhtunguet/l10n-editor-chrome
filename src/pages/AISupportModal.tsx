import type {ModalProps} from 'antd';
import {Button, Form, Input, Modal, Select} from 'antd';
import type {FC} from 'react';
import React, {useEffect} from 'react';
import {countryCodeMap, DEFAULT_PROMPT} from 'src/config/consts';
import useOpenAISettings from 'src/services/use-openai-settings';

const {Option} = Select;

interface AITranslationModalProps extends ModalProps {
  languages: string[];

  onCloseModal(): void;
}

const AITranslationModal: FC<AITranslationModalProps> = ({
  open,
  languages,
  onCloseModal,
  ...restProps
}) => {
  const [form] = Form.useForm();
  const {settings, setOpenAISettings, loading} = useOpenAISettings();

  // Load settings into the form when the modal is opened
  useEffect(() => {
    if (open && settings) {
      form.setFieldsValue(settings);
    }
  }, [open, settings, form]);

  // Handle form submission to save settings
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setOpenAISettings(values); // Save settings to Chrome storage
      onCloseModal(); // Close modal after saving
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Validation failed:', error);
    }
  };

  return (
    <Modal
      title="AI Translation Settings"
      open={open}
      {...restProps}
      footer={null}>
      <Form form={form} layout="vertical">
        <Form.Item label="OpenAI Base URL" name="baseUrl">
          <Input placeholder="https://api.openai.com/v1" />
        </Form.Item>
        <Form.Item
          label="OpenAI API Key"
          name="apiKey"
          help="You can find your API key in the OpenAI dashboard">
          <Input.Password placeholder="OpenAI API Key" />
        </Form.Item>
        <Form.Item label="OpenAI Model" name="model">
          <Input placeholder="Example: gpt-4-turbo, llama3.1, etc." />
        </Form.Item>
        <Form.Item
          label="Custom System Prompt"
          name="systemPrompt"
          initialValue={DEFAULT_PROMPT}>
          <Input.TextArea
            rows={5}
            placeholder="Custom instructions for AI translation"
          />
        </Form.Item>
        <Form.Item label="Source Language" name="sourceLang">
          <Select>
            {languages.map((lang) => (
              <Option key={lang} value={lang}>
                {countryCodeMap[lang]}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Destination Language" name="destLang">
          <Select>
            {languages.map((lang) => (
              <Option key={lang} value={lang}>
                {countryCodeMap[lang]}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Button type="primary" block onClick={handleSave} loading={loading}>
          Save Settings
        </Button>
      </Form>
    </Modal>
  );
};

export default AITranslationModal;
