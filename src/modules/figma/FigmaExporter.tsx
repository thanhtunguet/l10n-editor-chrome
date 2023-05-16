import type {FC} from 'react';
import React from 'react';
import Button from 'antd/lib/button';
import {figmaRepository} from 'src/repositories/figma-repository';
import Input from 'antd/lib/input';
import {snakeCase} from 'lodash';
import {slugify} from 'src/helpers/slugify';

const pattern =
  /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?=.*\d)[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{3,}$/;

const FigmaExporter: FC = () => {
  const [s, setS] = React.useState<string>('');
  return (
    <div>
      <Button
        onClick={async () => {
          const textNodes = await figmaRepository.fetchAllTextNodes(
            'NpsBFWJrTLgNshmCm0gCcz',
          );
          const nodes = textNodes.map(({id, name, characters}: any) => ({
            id,
            name,
            characters,
            slugified: characters.match(pattern)
              ? ''
              : snakeCase(slugify(characters)),
          }));
          console.log(nodes);
        }}>
        Export
      </Button>

      <Input value={s} onChange={(event) => setS(event.target.value)} />
    </div>
  );
};

export default FigmaExporter;
