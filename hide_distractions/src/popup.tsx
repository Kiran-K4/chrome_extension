import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntentionProvider } from './context/intentionPopupContext';
import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    chrome.storage.local.get('blurEnabled', ({ blurEnabled }) => {
      setBlurEnabled(blurEnabled !== false);
    });
    chrome.storage.local.get('commentsHidden', ({ commentsHidden }) => {
      setHidden(commentsHidden === true);
    });
  }, []);

  const handleBlurToggle = async () => {
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

  const handleCommentsToggle = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'toggleComments' },
      (res) => {
        if (!chrome.runtime.lastError && res?.status) {
          setHidden(res.status === 'hidden');
        }
      }
    );
  };

  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Focus Bear</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={blurEnabled} onChange={handleBlurToggle} />
          {blurEnabled ? 'Blur distractions' : 'Unblurred'}
        </label>
      </div>

      <div>
        <button onClick={handleCommentsToggle}>
          {hidden ? 'Show comments' : 'Hide comments'}
        </button>
      </div>
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