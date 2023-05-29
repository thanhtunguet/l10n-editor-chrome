import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import type {DevopsServer} from 'src/models/devops-server';
import type {GlobalState} from 'src/store/GlobalState';
import type {ProjectType} from 'src/types/ProjectType';

const initialState: GlobalState['editor'] = Object.freeze({
  supportedLocales: [],
  resources: {},
});

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    addKey(state, action: PayloadAction<string>) {
      const key = action.payload;
      state.resources[key] = {
        key: key,
      };
      for (const locale of state.supportedLocales) {
        state.resources[key][locale] = '';
      }
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

    deleteKey(state, action: PayloadAction<string>) {
      const key = action.payload;
      delete state.resources[key];
    },

    loadEditor(state, action: PayloadAction<GlobalState['editor']>) {
      state.supportedLocales = action.payload.supportedLocales;
      state.resources = action.payload.resources;
    },

    loadOnlineEditor(
      state,
      action: PayloadAction<{
        devopsServer: DevopsServer;
        projectId: string;
        repositoryId: string;
        projectType: ProjectType;
        resources: Record<string, Record<string, string>>;
        supportedLocales: string[];
      }>,
    ) {
      const {
        devopsServer,
        projectId,
        projectType,
        repositoryId,
        resources, //
        supportedLocales,
      } = action.payload;
      state.devopsServer = devopsServer;
      state.projectId = projectId;
      state.repositoryId = repositoryId;
      state.projectType = projectType;
      state.resources = resources;
      state.supportedLocales = supportedLocales;
    },

    closeEditor(state, _action: PayloadAction<void>) {
      Object.entries(state).forEach(([key]) => {
        state[key] = initialState[key];
      });
    },
  },
});
