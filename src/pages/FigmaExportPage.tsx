import {Button, Form, Input} from 'antd';
import React from 'react';
import type {FigmaLinkForm} from 'src/models/figma-link-form';
import {useFigmaExport} from 'src/services/use-figma-export';

const FigmaExportPage: React.FC = () => {
  const [form] = Form.useForm<FigmaLinkForm>();

  const [isLoading, handleExport] = useFigmaExport();

  return (
    <Form form={form} layout="vertical" onFinish={handleExport}>
      {/* Figma Link Input */}
      <Form.Item
        label="Figma Link"
        name="figmaLink"
        rules={[
          {required: true, message: 'Please enter the Figma file link'},
          {type: 'url', message: 'Please enter a valid URL'},
        ]}>
        <Input placeholder="Figma file link" />
      </Form.Item>

      {/* Export Button */}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Export
        </Button>
      </Form.Item>
    </Form>
  );
};

export default FigmaExportPage;
