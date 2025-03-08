import React from 'react';
import {OPENAI_DEFAULT_SETTINGS} from 'src/config/consts';
import type {OpenAISettings} from 'src/models/openai-settings';

const useOpenAISettings = () => {
  const [settings, setSettings] = React.useState<OpenAISettings>(
    OPENAI_DEFAULT_SETTINGS,
  );
  const [loading, setLoading] = React.useState(true);

  // 📌 Load settings from Chrome storage
  React.useEffect(() => {
    chrome.storage.sync.get(['openAIConfig'], (result) => {
      if (result.openAIConfig) {
        setSettings(result.openAIConfig);
      }
      setLoading(false);
    });

    // 📌 Listen for Chrome storage changes & update state
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.openAIConfig) {
        setSettings(changes.openAIConfig.newValue || OPENAI_DEFAULT_SETTINGS);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  // 📌 Save settings to Chrome storage
  const setOpenAISettings = (newSettings: OpenAISettings) => {
    chrome.storage.sync.set({openAIConfig: newSettings}, () => {
      setSettings(newSettings);
    });
  };

  return {settings, setOpenAISettings, loading};
};

export default useOpenAISettings;
