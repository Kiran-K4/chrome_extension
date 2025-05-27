import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/popup.css';

// UI toggle component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <div className={`toggle ${checked ? 'active' : 'inactive'}`} onClick={onChange}>
    <span className="toggle-text">{checked ? 'ON' : 'OFF'}</span>
    <div className="toggle-button" />
  </div>
);

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [homeBlurEnabled, setHomeBlurEnabled] = useState(true);
  const [shortsBlurEnabled, setShortsBlurEnabled] = useState(true);
  const [allFocusSessions, setAllFocusSessions] = useState<Record<string, { intention: string; timeLeft: number }>>({});

  // Load toggles
  useEffect(() => {
    chrome.storage.local.get(
      ['blurEnabled', 'commentsHidden', 'homePageBlurEnabled', 'shortsBlurEnabled'],
      ({ blurEnabled, commentsHidden, homePageBlurEnabled, shortsBlurEnabled }) => {
        setBlurEnabled(blurEnabled ?? true);
        setHidden(commentsHidden ?? true);
        setHomeBlurEnabled(homePageBlurEnabled ?? true);
        setShortsBlurEnabled(shortsBlurEnabled ?? true);
      }
    );
  }, []);

  // Live session timer update
  useEffect(() => {
    const updateSessions = () => {
      chrome.storage.local.get("focusData", ({ focusData }) => {
        const sessions: Record<string, { intention: string; timeLeft: number }> = {};
        const now = Date.now();

        if (focusData) {
          Object.entries(focusData).forEach(([domain, data]: [string, any]) => {
            const { focusStart, focusDuration, focusIntention } = data;
            const end = focusStart + focusDuration * 60 * 1000;
            const timeLeft = Math.floor((end - now) / 1000);

            if (timeLeft > 0) {
              sessions[domain] = {
                intention: focusIntention,
                timeLeft,
              };
            }
          });
        }

        setAllFocusSessions(sessions);
      });
    };

    console.log("sessions", allFocusSessions);
    updateSessions(); // first load
    const interval = setInterval(updateSessions, 1000); // update every second
    return () => clearInterval(interval);
  }, []);

  const toggleSetting = async (key: string, currentValue: boolean, messageType: string) => {
    const newValue = !currentValue;
    chrome.storage.local.set({ [key]: newValue });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: messageType,
        payload: newValue,
      });
    }

    switch (key) {
      case 'blurEnabled': setBlurEnabled(newValue); break;
      case 'commentsHidden': setHidden(newValue); break;
      case 'homePageBlurEnabled': setHomeBlurEnabled(newValue); break;
      case 'shortsBlurEnabled': setShortsBlurEnabled(newValue); break;
    }
  };

  const handleCommentsToggle = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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
const mainView = (
  <div className="main-view">
    <img src={iconUrl} alt="Focus Mode Icon" className="focus-logo" />
    <h1 className="popup-title">Focus Bear</h1>

    {Object.keys(allFocusSessions).length > 0 ? (
      <div className="session-list">
        {Object.entries(allFocusSessions).map(([domain, session]) => (
          <div key={domain} className="session-card">
            <strong className="domain">{domain}</strong><br />
            <span className="label">Time Left:</span> {formatTime(session.timeLeft)}<br />
            <span className="label">Intention:</span> {session.intention}
          </div>
        ))}
      </div>
    ) : (
      <p className="no-session">No active focus session.</p>
    )}

    <img
      src={setIcon}
      alt="Settings Icon"
      className="settings-icon"
      onClick={() => setShowSettings(true)}
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
          <Toggle checked={homeBlurEnabled} onChange={() => toggleSetting('homePageBlurEnabled', homeBlurEnabled, 'TOGGLE_HOME_PAGE_BLUR')} />
        </label>
        <label className="option-label">
          <span className="option-text">Blur Distractions</span>
          <Toggle checked={blurEnabled} onChange={() => toggleSetting('blurEnabled', blurEnabled, 'TOGGLE_BLUR')} />
        </label>
        <label className="option-label">
          <span className="option-text">Hide Comments</span>
          <Toggle checked={hidden} onChange={handleCommentsToggle} />
        </label>
        <label className="option-label">
          <span className="option-text">Blur Shorts</span>
          <Toggle checked={shortsBlurEnabled} onChange={() => toggleSetting('shortsBlurEnabled', shortsBlurEnabled, 'TOGGLE_SHORTS_BLUR')} />
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
    <App />
  </React.StrictMode>
);

