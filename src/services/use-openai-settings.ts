import {useState, useEffect} from 'react';

interface OpenAISettings {
  baseUrl: string;
  apiKey: string;
  model: string;
}

const DEFAULT_SETTINGS: OpenAISettings = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4-turbo',
};

const useOpenAISettings = () => {
  const [settings, setSettings] = useState<OpenAISettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // 📌 Load settings from Chrome storage
  useEffect(() => {
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
        setSettings(changes.openAIConfig.newValue || DEFAULT_SETTINGS);
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
