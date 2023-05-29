import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/ext-language_tools';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-monokai';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';
import {RouterProvider, createHashRouter} from 'react-router-dom';
import {PersistGate} from 'redux-persist/integration/react';
import DefaultLayout from 'src/components/templates/DefaultLayout';
import 'src/config/sentry';
import DevopsPage from 'src/modules/devops-page/DevopsPage';
import EditorPage from 'src/modules/editor-page/EditorPage';
import FigmaPage from 'src/modules/figma-page/FigmaPage';
import {persistor, store} from 'src/store';

const div = document.getElementById('root');
const root = createRoot(div);

const router = createHashRouter([
  {
    path: '/',
    children: [
      {
        path: FigmaPage.displayName,
        element: <FigmaPage />,
        action: async () => {},
      },
      {
        path: DevopsPage.displayName,
        element: <DevopsPage />,
        action: async () => {},
      },
      {
        path: EditorPage.displayName,
        element: <EditorPage />,
        action: async () => {},
      },
      {
        path: '/',
        element: (
          <>
            <EditorPage />
          </>
        ),
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
