import type {PayloadAction} from '@reduxjs/toolkit';
import {createSlice} from '@reduxjs/toolkit';
import type {GlobalState} from 'src/store/GlobalState';

const initialState: GlobalState['figma'] = {};

export const figmaSlice = createSlice({
  name: 'figma',
  initialState,
  reducers: {
    setApiKey(state, action: PayloadAction<string>) {
      state.apiKey = action.payload;
    },
  },
});
