import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {editorSlice} from 'src/store/slices/editor-slice';
import {persistReducer, persistStore} from 'redux-persist';
import {createLogger} from 'redux-logger';
import {devopsSlice} from 'src/store/slices/devops-slice';
import type {PersistConfig} from 'redux-persist/es/types';
import type {GlobalState} from 'src/store/GlobalState';

const chromeStorage: PersistConfig<any>['storage'] = {
  getItem: async (key: string) => {
    const result = await chrome.storage.sync.get(key);
    if (result.hasOwnProperty(key)) {
      return result[key];
    }
    return undefined;
  },
  setItem: async (key: string, value: string) => {
    await chrome.storage.sync.set({
      [key]: value,
    });
  },
  removeItem: async (key: string) => {
    await chrome.storage.sync.remove(key);
  },
};

const persistConfig: PersistConfig<GlobalState> = {
  key: 'root',
  storage: chromeStorage,
};

const editorPersistConfig: PersistConfig<GlobalState['editor']> = {
  key: 'editor',
  blacklist: ['supportedLocales', 'resources'],
  storage: chromeStorage,
};

const rootReducer = combineReducers({
  editor: persistReducer(editorPersistConfig, editorSlice.reducer),
  devops: devopsSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: [createLogger()],
});

export const persistor = persistStore(store);
