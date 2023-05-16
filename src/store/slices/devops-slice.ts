import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import type {GlobalState} from 'src/store/GlobalState';
import {DevopsServer} from 'src/models/devops-server';

const initialState: GlobalState['devops'] = {
  servers: [],
};

export const devopsSlice = createSlice({
  name: 'devops',
  initialState,
  reducers: {
    setServers(state, action: PayloadAction<DevopsServer[]>) {
      state.servers = action.payload;
    },
    saveServer(state, action: PayloadAction<DevopsServer>) {
      const {id, name, url} = action.payload;
      const devopsServer: DevopsServer = DevopsServer.create();
      if (!id) {
        devopsServer.id = state.servers.length + 1;
      }
      devopsServer.name = name;
      devopsServer.url = url.replace(/\/$/, '');

      const servers = state.servers.filter((s) => s.id !== id);

      state.servers = [...servers, devopsServer];
    },
    deleteServer(state, action: PayloadAction<DevopsServer>) {
      const {id} = action.payload;
      state.servers = state.servers.filter((s) => s.id !== id);
    },
  },
});
