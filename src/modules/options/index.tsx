import {PersistGate} from 'redux-persist/integration/react';
import {createRoot} from 'react-dom/client';
import React from 'react';
import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/ext-language_tools';
import {Provider} from 'react-redux';
import {persistor, store} from 'src/store';
import {createHashRouter, RouterProvider} from 'react-router-dom';
import Editor from 'src/modules/editor/Editor';
import DefaultLayout from 'src/components/templates/DefaultLayout';
import DevopsServers from 'src/modules/devops/DevopsServers';
import FigmaConfigForm from 'src/modules/figma/FigmaConfigForm';
import FigmaExporter from 'src/modules/figma/FigmaExporter';

const div = document.getElementById('root');
const root = createRoot(div);

const router = createHashRouter([
  {
    path: '/',
    children: [
      {
        path: '/figma',
        element: (
          <>
            <FigmaConfigForm />
            <FigmaExporter />
          </>
        ),
        action: async () => {},
      },
      {
        path: '/devops',
        element: <DevopsServers />,
        action: async () => {},
      },
      {
        path: '/',
        element: <Editor />,
        action: async () => {},
      },
    ],
    element: <DefaultLayout />,
  },
]);

root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <RouterProvider router={router} />
    </PersistGate>
  </Provider>,
);
