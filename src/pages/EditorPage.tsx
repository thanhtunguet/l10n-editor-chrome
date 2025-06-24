import { Spin } from 'antd';
import React from 'react';
import EditorToolbar from '../components/molecules/EditorToolbar';
import LocalizationTable from '../components/molecules/LocalizationTable';
import { ErrorBoundary } from '../components/ErrorBoundary';
import type { LocalizationRecord } from '../models/localization-record';
import { LocalizationService } from '../services/localization-service';
import { useAiSuggestion } from '../services/use-ai-suggestion';
import { useLocalizations } from '../services/use-localizations';
import { useEditorState, useFilteredLocalizations } from '../hooks/useEditorState';
import { ErrorHandler } from '../types/errors';

export default function EditorPage() {
  const localizationService = React.useRef<LocalizationService>(
    new LocalizationService(),
  ).current;

  const {
    locales,
    supportedLocales,
    handlePutLocalizations,
    handleChange,
    handleCreateNewKey,
    handleAddLanguage,
    handleDeleteKey,
    searchableNamespaces,
  } = useLocalizations();

  const {
    filteredNamespace,
    searchValue,
    translating,
    translateTitle,
    setFilteredNamespace,
    setSearchValue,
    startTranslation,
    finishTranslation,
  } = useEditorState();

  const { handleGetAiSuggestion } = useAiSuggestion();

  const filteredLocales = useFilteredLocalizations(locales, filteredNamespace);

  const handleTranslate = React.useCallback(
    async (record: LocalizationRecord): Promise<void> => {
      try {
        const translation = await handleGetAiSuggestion(record);
        handleChange(record.key, translation);
      } catch (error) {
        ErrorHandler.log(ErrorHandler.normalize(error));
        throw error;
      }
    },
    [handleGetAiSuggestion, handleChange],
  );

  const handleTranslateAll = React.useCallback(async () => {
    startTranslation('Translating');
    try {
      for (const locale of locales) {
        startTranslation(`Translating ${locale.key}`);
        await handleTranslate(locale);
      }
    } catch (error) {
      ErrorHandler.log(ErrorHandler.normalize(error));
    } finally {
      finishTranslation();
    }
  }, [locales, handleTranslate, startTranslation, finishTranslation]);

  const handleDownload = React.useCallback(
    async (localesToDownload: LocalizationRecord[]) => {
      try {
        await localizationService.generateAndDownloadLocalizationZip(localesToDownload);
      } catch (error) {
        ErrorHandler.log(ErrorHandler.normalize(error));
      }
    },
    [localizationService],
  );

  return (
    <ErrorBoundary>
      <EditorToolbar
        searchableNamespaces={searchableNamespaces}
        filteredNamespace={filteredNamespace}
        searchValue={searchValue}
        supportedLocales={supportedLocales}
        filteredLocales={filteredLocales}
        allLocales={locales}
        onNamespaceChange={setFilteredNamespace}
        onSearchChange={setSearchValue}
        onImport={(supportedLocales, resources) => {
          handlePutLocalizations(supportedLocales, Object.values(resources));
        }}
        onDownload={handleDownload}
        onAITranslateAll={handleTranslateAll}
        onAddLanguage={handleAddLanguage}
        onCreateNewKey={handleCreateNewKey}
      />
      
      <Spin spinning={translating} tip={translateTitle}>
        <LocalizationTable
          dataSource={filteredLocales}
          supportedLocales={supportedLocales}
          onChange={handleChange}
          onTranslate={handleTranslate}
          onDeleteKey={handleDeleteKey}
          loading={translating}
        />
      </Spin>
    </ErrorBoundary>
  );
}
