import {combineReducers, configureStore} from '@reduxjs/toolkit';
import {createLogger} from 'redux-logger';
import {persistReducer, persistStore} from 'redux-persist';
import type {PersistConfig} from 'redux-persist/es/types';
import type {GlobalState} from 'src/store/GlobalState';
import {devopsSlice} from 'src/store/slices/devops-slice';
import {editorSlice} from 'src/store/slices/editor-slice';

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
  whitelist: ['devops'],
};

const rootReducer = combineReducers({
  editor: editorSlice.reducer,
  devops: devopsSlice.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: [createLogger()],
});

export const persistor = persistStore(store);
