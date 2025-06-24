import {PlusOutlined} from '@ant-design/icons';
import {Button, Form, Input, Modal} from 'antd';
import React from 'react';

interface NewLocaleFormModalProps {
  onAddLanguage: (languageKey: string) => void;
  children: React.ReactNode;
}

export default function NewLocaleFormModal({
  onAddLanguage,
  children,
}: NewLocaleFormModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [form] = Form.useForm();

  const handleOpen = () => {
    setIsVisible(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onAddLanguage(values.languageKey);
      handleClose();
    } catch (error) {
      // Form validation failed
    }
  };

  return (
    <>
      <Button
        type="primary"
        className="d-flex align-items-center mx-1"
        icon={<PlusOutlined />}
        onClick={handleOpen}>
        {children}
      </Button>
      <Modal
        title="Add new language"
        open={isVisible}
        onOk={handleSubmit}
        onCancel={handleClose}
        destroyOnClose>
        <Form form={form}>
          <Form.Item
            label="Language Key"
            name="languageKey"
            rules={[
              {required: true, message: 'Please enter a language key'},
              {max: 2, message: 'Language key must be 2 characters or less'},
            ]}>
            <Input
              maxLength={2}
              placeholder="2-chars language key"
              onPressEnter={handleSubmit}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
