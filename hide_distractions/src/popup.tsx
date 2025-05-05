import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntentionProvider } from './context/intentionPopupContext';

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);

  // Load saved blur state from chrome.storage
  useEffect(() => {
    chrome.storage.local.get('blurEnabled', ({ blurEnabled }) => {
      setBlurEnabled(blurEnabled !== false); // default to true if undefined
    });
  }, []);

  const handleToggle = async () => {
    const newValue = !blurEnabled;
    setBlurEnabled(newValue);
    chrome.storage.local.set({ blurEnabled: newValue });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_BLUR',
        payload: newValue,
      });
    }
  };

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Focus Bear</h1>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={blurEnabled} onChange={handleToggle} />
        {blurEnabled ? 'Blur distractions' : 'Unblurred'}
      </label>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntentionProvider>
      <App />
    </IntentionProvider>
  </React.StrictMode>
);
