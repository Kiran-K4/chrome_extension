import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  IntentionProvider,
  useIntention,
} from "./context/intentionPopupContext";
import { useFocusTimer } from "./hooks/useFocusTimer";


const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [hidden, setHidden] = useState(false);
 
  const { intention, timeLeft, timerActive } = useFocusTimer();


  useEffect(() => {
    chrome.storage.local.get("blurEnabled", ({ blurEnabled }) => {
      setBlurEnabled(blurEnabled !== false);
    });
    chrome.storage.local.get("commentsHidden", ({ commentsHidden }) => {
      setHidden(commentsHidden === true);
    });
  }, []);

  // Blur sidebar and chips
  const handleBlurToggle = async () => {
    const newValue = !blurEnabled;
    setBlurEnabled(newValue);
    chrome.storage.local.set({ blurEnabled: newValue });

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "TOGGLE_BLUR",
        payload: newValue,
      });
    }
  };

  // Blur comments
  const handleCommentsToggle = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { action: "toggleComments" }, (res) => {
      if (!chrome.runtime.lastError && res?.status) {
        setHidden(res.status === "hidden");
      }
    });
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Focus Bear</h1>

      <div style={{ marginBottom: 16 }}>
        <button onClick={handleBlurToggle}>
          {blurEnabled ? "Show sidebar/chips" : "Blur sidebar/chips"}
        </button>
      </div>

      <div>
        <button onClick={handleCommentsToggle}>
          {hidden ? "Show comments" : "Blur comments"}
        </button>
      </div>

      {timerActive ? (
        <div style={{ marginTop: 20 }}>
          <strong>Intention:</strong> <span>{intention}</span>
          <br />
          <strong>Time Left:</strong> <span>{formatTime(timeLeft)}</span>
        </div>
      ) : (
        <p style={{ marginTop: 20 }}>No active focus session.</p>
      )}
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
