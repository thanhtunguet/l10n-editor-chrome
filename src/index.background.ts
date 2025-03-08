import {OPENAI_DEFAULT_SETTINGS} from './config/consts';

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

/**
 * Initializes OpenAI settings if they don't exist in Chrome Storage.
 */
const initializeOpenAISettings = () => {
  chrome.storage.sync.get(['openAIConfig'], (result) => {
    if (!result.openAIConfig) {
      // eslint-disable-next-line no-console
      console.log('Initializing default OpenAI settings...');
      chrome.storage.sync.set({openAIConfig: OPENAI_DEFAULT_SETTINGS}, () => {
        // eslint-disable-next-line no-console
        console.log('Default OpenAI settings saved.');
      });
    }
  });
};

// Run the initialization when the extension loads
initializeOpenAISettings();
