import React from 'react';
import {createRoot} from 'react-dom/client';
import {createHashRouter, RouterProvider} from 'react-router-dom';
import AppLayout from './components/AppLayout';
import {AppRoute} from './config/routes';
import EditorPage from './pages/EditorPage';
import FigmaExportPage from './pages/FigmaExportPage';
import SettingsForm from './components/SettingForms';

const router = createHashRouter([
  {
    path: AppRoute.HOME,
    element: <AppLayout />,
    children: [
      {
        path: AppRoute.FIGMA_EXPORT,
        element: <FigmaExportPage />,
      },
      {
        path: AppRoute.EDITOR,
        element: <EditorPage />,
      },
      {
        path: AppRoute.HOME,
        element: <SettingsForm />,
      },
    ],
  },
]);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
