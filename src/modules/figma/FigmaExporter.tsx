import type {FC} from 'react';
import React from 'react';
import Button from 'antd/lib/button';
import {figmaRepository} from 'src/repositories/figma-repository';
import Input from 'antd/lib/input';
import {snakeCase} from 'lodash';
import {slugify} from 'src/helpers/slugify';
import Form from 'antd/lib/form';
import {Spin} from 'antd';

const pattern =
  /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*\d)[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{3,}$/;

const layout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
};

const FigmaExporter: FC = () => {
  const [loading, setLoading] = React.useState<boolean>(false);

  const [s, setS] = React.useState<string>('');

  const [form] = Form.useForm<{
    figmaLink: string;
  }>();

  return (
    <Spin spinning={loading}>
      <Form form={form} {...layout}>
        <Form.Item label="Figma Link" name="figmaLink" initialValue="">
          <Input value={s} onChange={(event) => setS(event.target.value)} />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}>
          <Button
            onClick={async () => {
              setLoading(true);
              const textNodes = await figmaRepository.fetchAllTextNodes(
                'Eg4tBd2WISMYctioPinUrK',
              );
              const nodes = textNodes.map(({id, name, characters}: any) => ({
                id,
                name,
                characters,
                slugified: characters.match(pattern)
                  ? ''
                  : snakeCase(slugify(characters)),
              }));
              setLoading(false);
            }}>
            Export
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default FigmaExporter;
