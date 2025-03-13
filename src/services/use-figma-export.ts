import type {FormProps} from 'antd';
import type * as Figma from 'figma-api';
import React from 'react';
import type {ExtensionSettings} from 'src/models/extension-settings';
import type {FigmaLinkForm} from 'src/models/figma-link-form';
import type {LocalizationRecord} from 'src/models/localization-record';
import {FigmaRepository} from 'src/repositories/figma-repository';
import {LocalizationService} from './localization-service';

const LANGUAGE_SEPARATOR = '//';

export function useFigmaExport(): [boolean, FormProps['onFinish']] {
  const localizationService = React.useRef<LocalizationService>(
    new LocalizationService(),
  ).current;

  const [loading, setLoading] = React.useState<boolean>(false);

  const [figmaRepository, setFigmaRepository] =
    React.useState<FigmaRepository>();

  React.useEffect(() => {
    chrome.storage.sync.get(
      'extensionSettings',
      ({extensionSettings}: {extensionSettings: ExtensionSettings}) => {
        const figmaApiKey = extensionSettings?.figmaApiKey;
        setFigmaRepository(new FigmaRepository(figmaApiKey));
      },
    );
  }, []);

  const handleExport: FormProps['onFinish'] = React.useCallback(
    async ({figmaLink}: FigmaLinkForm) => {
      try {
        setLoading(true);
        const regex = /\/(file|design)\/([A-Za-z0-9-_]+)\//;
        const matches = figmaLink.match(regex);
        const fileKey = matches ? matches[2] : null;

        const textNodes = await figmaRepository!.fetchAllTextNodes(fileKey!);

        const maps = Object.fromEntries(
          textNodes
            .filter(({name}: Figma.Node<'TEXT'>) => {
              return (
                !name.match(/^[0-9_]+$/) &&
                name.toLowerCase().match(/^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+$/)
              );
            })
            .map(({characters, name}): [string, LocalizationRecord] => {
              const [vi, en] = characters.split(LANGUAGE_SEPARATOR);
              return [name, {key: name, vi, en: en || vi}];
            }),
        );
        localizationService.exportToLocalizationsExcel(maps);
      } catch (e) {
        /// TODO: handle exception
      } finally {
        setLoading(false);
      }
    },
    [figmaRepository, localizationService],
  );

  return [loading, handleExport];
}
