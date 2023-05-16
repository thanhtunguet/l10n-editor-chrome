import React from 'react';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Button from 'antd/lib/button';
import notification from 'antd/lib/notification';
import type {NotificationPlacement} from 'antd/lib/notification/interface';

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};

const tailLayout = {
  wrapperCol: {offset: 8, span: 16},
};

const FigmaConfigForm: React.FC = () => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    chrome.storage.sync.get('figmaApiKey').then((apiKey) => {
      form.setFieldsValue(apiKey);
    });
  }, [form]);

  const [api, contextHolder] = notification.useNotification();

  const openNotification = React.useCallback(
    (placement: NotificationPlacement) => {
      api.info({
        message: 'Saved Figma API Key',
        description: 'Figma API Key has been saved successfully!',
        placement,
      });
    },
    [api],
  );

  const onFinish = React.useCallback(
    async (values: any) => {
      await chrome.storage.sync.set(values);
      openNotification('topRight');
    },
    [openNotification],
  );

  return (
    <div className="m-4">
      {contextHolder}
      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item
          name="figmaApiKey"
          label="Figma API Key"
          rules={[{required: true}]}>
          <Input />
        </Form.Item>
        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default FigmaConfigForm;
