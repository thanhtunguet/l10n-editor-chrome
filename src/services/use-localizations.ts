import type {Reducer} from 'react';
import React from 'react';
import type {LocalizationRecord} from 'src/models/localization-record';

export enum LocalizationActionType {
  PUT = 'PUT',
  PATCH = 'PATCH',
  CREATE = 'CREATE',
}

type LocalizationAction = {
  type: LocalizationActionType;
  payload: {
    key?: string;
    record?: LocalizationRecord;
    supportedLocales?: string[];
    resources?: LocalizationRecord[];
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
} {
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

  return {
    locales,
    supportedLocales,
    handlePutLocalizations,
    handleChange,
    handleCreateNewKey,
  };
}
