import type {MenuItemType} from 'antd/es/menu/interface';
import {AppRoute} from './routes';

export const items: MenuItemType[] = [
  {
    key: AppRoute.HOME,
    label: 'Home',
  },
  {
    key: AppRoute.FIGMA_EXPORT,
    label: 'Figma',
  },
  {
    key: AppRoute.EDITOR,
    label: 'Editor',
  },
];
