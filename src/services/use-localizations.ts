import type {Reducer} from 'react';
import React from 'react';
import type {LocalizationRecord} from 'src/models/localization-record';

export enum LocalizationActionType {
  PUT = 'PUT',
  PATCH = 'PATCH',
  CREATE = 'CREATE',
  ADD_KEY = 'ADD_KEY',
  DELETE_KEY = 'DELETE_KEY',
}

function distinctStrings(value: string[]): string[] {
  return Array.from(new Set(value));
}

type LocalizationAction = {
  type: LocalizationActionType;
  payload: {
    key?: string;
    record?: LocalizationRecord;
    supportedLocales?: string[];
    resources?: LocalizationRecord[];
    newLanguageKey?: string;
  };
};

type LocalizationState = {
  locales: LocalizationRecord[];
  supportedLocales: string[];
};

function localizationReducer(
  state: LocalizationState,
  action: LocalizationAction,
): LocalizationState {
  switch (action.type) {
    case LocalizationActionType.PUT:
      return {
        ...state,
        supportedLocales: action.payload.supportedLocales ?? [],
        locales: action.payload.resources ?? [],
      };

    case LocalizationActionType.PATCH:
      return {
        ...state,
      };

    case LocalizationActionType.ADD_KEY:
      const {newLanguageKey} = action.payload;

      state.locales.forEach((locale) => {
        if (!Object.prototype.hasOwnProperty.call(locale, newLanguageKey!)) {
          locale[newLanguageKey!] = '';
        }
      });

      const existed = state.supportedLocales.indexOf(newLanguageKey!) !== -1;
      if (!existed) {
        state.supportedLocales.push(newLanguageKey!);
      }

      return {
        ...state,
      };

    case LocalizationActionType.DELETE_KEY:
      const {key} = action.payload;

      state.locales = state.locales.filter((locale) => locale.key !== key);

      return {
        ...state,
      };

    case LocalizationActionType.CREATE:
      return {
        ...state,
        locales: [{key: action.payload.key!, en: '', vi: ''}, ...state.locales],
      };

    default:
      return state;
  }
}

export function useLocalizations(): {
  locales: LocalizationRecord[];
  supportedLocales: string[];
  handlePutLocalizations: (
    supportedLocales: string[],
    resources: LocalizationRecord[],
  ) => void;
  handleChange: (key: string, record: LocalizationRecord) => void;
  handleCreateNewKey: (key: string) => void;
  handleAddLanguage: (newLanguageKey: string) => void;
  searchableNamespaces: string[];
  handleDeleteKey: (key: string) => void;
} {
  const [searchableNamespaces, setSearchableNamespaces] = React.useState<
    string[]
  >([]);

  const [{locales, supportedLocales}, dispatch] = React.useReducer<
    Reducer<LocalizationState, LocalizationAction>
  >(localizationReducer, {
    locales: [],
    supportedLocales: [],
  });

  const handlePutLocalizations = React.useCallback(
    (supportedLocales: string[], resources: LocalizationRecord[]) => {
      dispatch({
        type: LocalizationActionType.PUT,
        payload: {supportedLocales, resources},
      });
    },
    [],
  );

  const handleChange = React.useCallback(
    (key: string, record: LocalizationRecord) => {
      dispatch({
        type: LocalizationActionType.PATCH,
        payload: {key, record},
      });
    },
    [],
  );

  const handleCreateNewKey = React.useCallback((key: string) => {
    dispatch({
      type: LocalizationActionType.CREATE,
      payload: {key},
    });
  }, []);

  React.useEffect(() => {
    if (locales) {
      const namespaces = distinctStrings(
        locales.map((record) => record.key.split('.')[0]),
      );
      setSearchableNamespaces(namespaces);
    }
  }, [locales]);

  const handleAddLanguage = React.useCallback((newLanguageKey: string) => {
    dispatch({
      type: LocalizationActionType.ADD_KEY,
      payload: {
        newLanguageKey,
      },
    });
  }, []);

  const handleDeleteKey = React.useCallback((key: string) => {
    dispatch({
      type: LocalizationActionType.DELETE_KEY,
      payload: {
        key,
      },
    });
  }, []);

  return {
    locales,
    supportedLocales,
    handlePutLocalizations,
    handleChange,
    handleCreateNewKey,
    searchableNamespaces,
    handleAddLanguage,
    handleDeleteKey,
  };
}
