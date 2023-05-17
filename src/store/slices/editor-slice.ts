import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import type {GlobalState} from 'src/store/GlobalState';

const initialState: GlobalState['editor'] = {
  supportedLocales: [],
  resources: {},
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    loadEditor(state, action: PayloadAction<GlobalState['editor']>) {
      state.supportedLocales = action.payload.supportedLocales;
      state.resources = action.payload.resources;
    },
    setNewKey(
      state,
      action: PayloadAction<{
        language: string;
        key: string;
        value: string;
      }>,
    ) {
      const {language, key, value} = action.payload;
      if (!state.resources.hasOwnProperty(key)) {
        state.resources[key] = {};
      }
      state.resources[key][language] = value;
    },
    addNewKey(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.resources[key] = {
        key: key,
      };
      for (const locale of state.supportedLocales) {
        state.resources[key][locale] = '';
      }
    },
    cancelEditor(state, _action: PayloadAction<void>) {
      state.resources = {};
      state.supportedLocales = [];
    },
    deleteKey(state, action: PayloadAction<string>) {
      const key = action.payload;
      delete state.resources[key];
    },
  },
});
