import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntentionProvider } from "./context/intentionPopupContext";
import { useFocusTimer } from "./hooks/useFocusTimer";
import "./styles/popup.css";
import iconUrl from '../public/icons/bearLogo.png';
import setIcon from '../public/icons/settingsIcon.png';

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div className={`toggle ${checked ? 'active' : 'inactive'}`} onClick={onChange}>
    <span className="toggle-text">{checked ? 'ON' : 'OFF'}</span>
    <div className="toggle-button" />
  </div>
);

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [homeBlurEnabled, setHomeBlurEnabled] = useState(true);
  const [shortsBlurEnabled, setShortsBlurEnabled] = useState(true);
  const { intention, timeLeft, timerActive } = useFocusTimer();
  const [showSettings, setShowSettings] = useState(false);

  const [linkedinBlurPYMK, setLinkedinBlurPYMK] = useState(true);

  useEffect(() => {
    chrome.storage.local.get({ blurEnabled: true }, ({ blurEnabled }) => {
      setBlurEnabled(blurEnabled);
    });
    chrome.storage.local.get({ commentsHidden: true }, ({ commentsHidden }) => {
      setHidden(commentsHidden);
    });
    chrome.storage.local.get({ homePageBlurEnabled: true }, ({ homePageBlurEnabled }) => {
      setHomeBlurEnabled(homePageBlurEnabled);
    });
    chrome.storage.local.get({ shortsBlurEnabled: true }, ({ shortsBlurEnabled }) => {
      setShortsBlurEnabled(shortsBlurEnabled);
    });
    chrome.storage.local.get({ linkedinBlurPYMK: true }, ({ linkedinBlurPYMK }) => {
      setLinkedinBlurPYMK(linkedinBlurPYMK);
    });
  }, []);

  const handleShortsBlurToggle = async () => {
    const newValue = !shortsBlurEnabled;
    setShortsBlurEnabled(newValue);
    chrome.storage.local.set({ shortsBlurEnabled: newValue });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SHORTS_BLUR', payload: newValue });
    }
  };

  const handleBlurToggle = async () => {
    const newValue = !blurEnabled;
    setBlurEnabled(newValue);
    chrome.storage.local.set({ blurEnabled: newValue });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_BLUR", payload: newValue });
    }
  };

  const handleCommentsToggle = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, { action: "toggleComments" }, (res) => {
      if (!chrome.runtime.lastError && res?.status) {
        setHidden(res.status === "hidden");
      }
    });
  };

  const handleHomeBlurToggle = async () => {
    const newValue = !homeBlurEnabled;
    setHomeBlurEnabled(newValue);
    chrome.storage.local.set({ homePageBlurEnabled: newValue });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_HOME_PAGE_BLUR', payload: newValue });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleLinkedinBlurToggle = async () => {
    const newValue = !linkedinBlurPYMK;
    setLinkedinBlurPYMK(newValue);
    await chrome.storage.local.set({ linkedinBlurPYMK: newValue });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_LINKEDIN_BLUR',
        payload: newValue
      });
    }
  };

  const mainView = (
    <div>
      <img src={iconUrl} alt="Focus Mode Icon" className="focus-logo" />
      <h1 className="popup-title">Focus Bear</h1>

      {timerActive ? (
        <div className="timer-section">
          <strong>Time Left:</strong> <span>{formatTime(timeLeft)}</span>
          <strong>Intention:</strong> <span>{intention}</span><br/>
        </div>
      ) : (
        <p className="no-session">No active focus session.</p>
      )}

      <img src={setIcon} alt="Settings Icon" className="settings-icon"
        onClick={() => {
          if (timerActive) {
            alert("Settings cannot be configured during a session");
          } else {
            setShowSettings(true);
          }
        }}
      />
    </div>
  );

  const settingsView = (
    <div>
      <img src={iconUrl} alt="Focus Mode Icon" className="focus-logo" />
      <h2 className="settings-title">Settings</h2>
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
        <label className="option-label">
          <span className="option-text">Blur Shorts</span>
          <Toggle checked={shortsBlurEnabled} onChange={handleShortsBlurToggle} />
        </label>
        <label className="option-label">
          <span className="option-text">Blur “People You May Know”</span>
          <Toggle
            checked={linkedinBlurPYMK}
            onChange={handleLinkedinBlurToggle} />
        </label>
      </div>
      <button className="close-button" onClick={() => setShowSettings(false)}>
        Close
      </button>
    </div>
  );

  return (
    <div className="popup-container">
      {showSettings ? settingsView : mainView}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IntentionProvider>
      <App />
    </IntentionProvider>
  </React.StrictMode>
);
