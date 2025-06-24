import React from 'react';
import type { LocalizationRecord } from '../models/localization-record';

interface EditorState {
  filteredNamespace: string;
  searchValue: string;
  translating: boolean;
  translateTitle: string;
}

interface UseEditorStateReturn extends EditorState {
  setFilteredNamespace: (namespace: string) => void;
  setSearchValue: (value: string) => void;
  setTranslating: (translating: boolean) => void;
  setTranslateTitle: (title: string) => void;
  startTranslation: (title: string) => void;
  finishTranslation: () => void;
}

/**
 * Custom hook for managing editor state
 */
export function useEditorState(): UseEditorStateReturn {
  const [state, setState] = React.useState<EditorState>({
    filteredNamespace: '',
    searchValue: '',
    translating: false,
    translateTitle: '',
  });

  const setFilteredNamespace = React.useCallback((namespace: string) => {
    setState((prev) => ({ ...prev, filteredNamespace: namespace }));
  }, []);

  const setSearchValue = React.useCallback((value: string) => {
    setState((prev) => ({ ...prev, searchValue: value }));
  }, []);

  const setTranslating = React.useCallback((translating: boolean) => {
    setState((prev) => ({ ...prev, translating }));
  }, []);

  const setTranslateTitle = React.useCallback((title: string) => {
    setState((prev) => ({ ...prev, translateTitle: title }));
  }, []);

  const startTranslation = React.useCallback((title: string) => {
    setState((prev) => ({
      ...prev,
      translating: true,
      translateTitle: title,
    }));
  }, []);

  const finishTranslation = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      translating: false,
      translateTitle: '',
    }));
  }, []);

  return {
    ...state,
    setFilteredNamespace,
    setSearchValue,
    setTranslating,
    setTranslateTitle,
    startTranslation,
    finishTranslation,
  };
}

/**
 * Custom hook for filtering localization data
 */
export function useFilteredLocalizations(
  locales: LocalizationRecord[],
  filteredNamespace: string,
) {
  return React.useMemo(() => {
    if (!filteredNamespace) {
      return locales;
    }
    return locales.filter((locale) => locale.key.startsWith(filteredNamespace));
  }, [locales, filteredNamespace]);
}