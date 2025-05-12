import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntentionProvider } from './context/intentionPopupContext';
import './styles/popup.css';

// Remove the root background color settings
document.body.style.margin = '0';

// Add custom Toggle component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
  return (
    <div className={`toggle ${checked ? 'active' : 'inactive'}`} onClick={onChange}>
      <span className="toggle-text">
        {checked ? 'ON' : 'OFF'}
      </span>
      <div className="toggle-button" />
    </div>
  );
};

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [homeBlurEnabled, setHomeBlurEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get('blurEnabled', ({ blurEnabled }) => {
      setBlurEnabled(blurEnabled !== false);
    });
    chrome.storage.local.get('commentsHidden', ({ commentsHidden }) => {
      setHidden(commentsHidden === true);
    });
    chrome.storage.local.get({ homePageBlurEnabled: true }, ({ homePageBlurEnabled }) => {
      setHomeBlurEnabled(homePageBlurEnabled);
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

  const handleHomeBlurToggle = async () => {
    const newValue = !homeBlurEnabled;
    setHomeBlurEnabled(newValue);
    chrome.storage.local.set({ homePageBlurEnabled: newValue });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_HOME_PAGE_BLUR',
        payload: newValue,
      });
    }
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <img 
          src="/icons/icon128.png" 
          alt="Bear Icon" 
          className="popup-logo"
        />
        <h1 className="popup-title">YouTube</h1>
      </div>

      <div className="options-container">
        <label className="option-label">
          <span className="option-text">Blur Home Page</span>
          <Toggle checked={homeBlurEnabled} onChange={handleHomeBlurToggle} />
        </label>

        <label className="option-label">
          <span className="option-text">Blur Distractions</span>
          <Toggle checked={blurEnabled} onChange={handleBlurToggle} />
        </label>

        <label className="option-label">
          <span className="option-text">Hide Comments</span>
          <Toggle checked={hidden} onChange={handleCommentsToggle} />
        </label>
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