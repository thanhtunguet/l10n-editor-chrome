import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import {DevopsServer} from 'src/models/devops-server';
import type {GlobalState} from 'src/store/GlobalState';

const initialState: GlobalState['devops'] = {
  servers: [],
};

export const devopsSlice = createSlice({
  name: 'devops',
  initialState,
  reducers: {
    // load server list
    setServers(state, action: PayloadAction<DevopsServer[]>) {
      state.servers = action.payload;
    },
    // To update or save a new server
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
    // To delete a server from list
    deleteServer(state, action: PayloadAction<DevopsServer>) {
      const {id} = action.payload;
      state.servers = state.servers.filter((s) => s.id !== id);
    },
  },
});
