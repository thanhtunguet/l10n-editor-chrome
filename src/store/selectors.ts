import type {GlobalState} from './GlobalState';

export const localeSelector = (state: GlobalState) =>
  state.editor.supportedLocales;

export const serverSelector = (state: GlobalState) => state.devops.servers;

export const isOnlineSelector = (state: GlobalState) =>
  !!state.editor.devopsServer;

export const resourceSelector = (state: GlobalState) => state.editor.resources;

export const figmaApiKeySelector = (state: GlobalState) => state.figma.apiKey;
