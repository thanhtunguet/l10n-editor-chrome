import type {FC} from 'react';
import React from 'react';
import Button from 'antd/lib/button';
import {figmaRepository} from 'src/repositories/figma-repository';
import Input from 'antd/lib/input';
import {snakeCase} from 'lodash';
import {slugify} from 'src/helpers/slugify';
import type {FormProps} from 'antd/lib/form';
import Form from 'antd/lib/form';
import Spin from 'antd/lib/spin';
import {exportToLocalizationsExcel} from 'src/helpers/excel';

type FigmaLinkForm = {
  figmaLink: string;
};

const pattern =
  /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*\d)[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{3,}$/;

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};

const FigmaExporter: FC = () => {
  const [loading, setLoading] = React.useState<boolean>(false);

  const [form] = Form.useForm<FigmaLinkForm>();

  const handleExport: FormProps['onFinish'] = React.useCallback(
    async ({figmaLink}: FigmaLinkForm) => {
      setLoading(true);
      const regex = /\/file\/([A-Za-z0-9-_]+)\//;
      const matches = figmaLink.match(regex);
      const fileKey = matches ? matches[1] : null;

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
          : snakeCase(slugify(characters)),
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
      setLoading(false);
    },
    [],
  );

  return (
    <Spin spinning={loading}>
      <Form form={form} {...layout} onFinish={handleExport}>
        <Form.Item label="Figma Link" name="figmaLink" initialValue="">
          <Input />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}>
          <Button htmlType="submit">Export</Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default FigmaExporter;
