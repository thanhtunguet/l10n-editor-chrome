import {SettingOutlined} from '@ant-design/icons';
import {captureException} from '@sentry/react';
import Button from 'antd/lib/button';
import type {FormProps} from 'antd/lib/form';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import notification from 'antd/lib/notification';
import Spin from 'antd/lib/spin';
import {snakeCase} from 'lodash';
import type {FC} from 'react';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useBoolean} from 'react3l';
import {exportToLocalizationsExcel} from 'src/helpers/excel';
import {vietnameseSlugify} from 'src/helpers/slugify';
import {figmaRepository} from 'src/repositories/figma-repository';
import type {GlobalState} from 'src/store/GlobalState';
import {figmaApiKeySelector} from 'src/store/selectors';
import {figmaSlice} from 'src/store/slices/figma-slice';

type FigmaLinkForm = {
  figmaLink: string;
};

const pattern =
  /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*\d)[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{3,}$/;

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};

const FigmaPage: FC = () => {
  const [loading, setLoading] = React.useState<boolean>(false);

  const dispatch = useDispatch();

  const [form] = Form.useForm<FigmaLinkForm>();

  const [visible, setVisible] = useBoolean(false);

  const apiKey = useSelector(figmaApiKeySelector);

  console.log(apiKey);

  const [api, contextHolder] = notification.useNotification();

  const openNotification = React.useCallback(
    (title: string, description: string, type: 'error' | 'info' = 'info') => {
      const method = type === 'error' ? api.error : api.info;
      method({
        message: title,
        description,
        placement: 'topRight',
      });
    },
    [api],
  );

  const handleExport: FormProps['onFinish'] = React.useCallback(
    async ({figmaLink}: FigmaLinkForm) => {
      try {
        setLoading(true);
        const regex = /\/(file|design)\/([A-Za-z0-9-_]+)\//;
        const matches = figmaLink.match(regex);
        const fileKey = matches ? matches[2] : null;

        const textNodes = await figmaRepository.fetchAllTextNodes(fileKey);
        const nodes: {
          id: string;
          name: string;
          characters: string;
          slugified: string;
        }[] = textNodes.map(({id, name, characters}: any) => ({
          id,
          name,
          characters,
          slugified: characters.match(pattern)
            ? ''
            : snakeCase(vietnameseSlugify(characters)),
        }));
        const maps = Object.fromEntries(
          nodes
            .map(({characters, slugified}) => [
              slugified,
              {key: slugified, vi: characters},
            ])
            .filter(
              ([key]: [string, any]) => !(key.match(/^[0-9_]+$/) || key === ''),
            ),
        );
        exportToLocalizationsExcel(maps);
      } catch (e) {
        captureException(e);
        openNotification(
          'Exporting failed',
          'Can not export Figma file. Please check your link or API token. If the issue persists, contact your administrator',
          'error',
        );
      } finally {
        setLoading(false);
      }
    },
    [openNotification],
  );

  const [figmaConfigForm] = Form.useForm<GlobalState['figma']>();

  const handleSaveFigmaApiKey = React.useCallback(
    async (values: GlobalState['figma']) => {
      dispatch(figmaSlice.actions.setApiKey(values.apiKey));
      openNotification('Saved successfully', 'Figma API Key has been saved');
    },
    [openNotification, dispatch],
  );

  return (
    <Spin spinning={loading}>
      {contextHolder}
      <Form form={form} {...layout} onFinish={handleExport}>
        <Form.Item label="Figma Link" name="figmaLink" initialValue={apiKey}>
          <Input />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 8,
          }}>
          <Button htmlType="submit" type="primary">
            Export
          </Button>
          <Button
            htmlType="button"
            onClick={setVisible}
            type="default"
            className="mx-4"
            icon={<SettingOutlined />}>
            API Key
          </Button>
        </Form.Item>
      </Form>
      <Modal
        open={visible}
        closable={true}
        destroyOnClose={true}
        onCancel={setVisible}
        onOk={() => {
          figmaConfigForm.submit();
          setVisible();
        }}>
        <Form
          className="mt-4 pt-2"
          {...layout}
          form={figmaConfigForm}
          name="control-hooks"
          onFinish={handleSaveFigmaApiKey}>
          <Form.Item
            name="apiKey"
            label="Figma API Key"
            initialValue={apiKey}
            rules={[{required: true}]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
};

FigmaPage.displayName = '/figma';

export default FigmaPage;
