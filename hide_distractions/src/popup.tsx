import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import {
  IntentionProvider,
  useIntention,
} from "./context/intentionPopupContext";

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [hidden, setHidden] = useState(false);
  const {
    intention,
    setIntention,
    setTimer,
    setTimerActive,
    timeLeft,
    setTimeLeft,
    timerActive,
  } = useIntention();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(timeLeft);


  useEffect(() => {
    timeRef.current = timeLeft;
  }, [timeLeft]);


  /// Restore timer on popup open
  useEffect(() => {
    chrome.storage.local.get(
      ["focusStart", "focusDuration", "focusIntention"],
      (result) => {
        console.log("🧠 Loaded from chrome.storage.local:", result);
        const { focusStart, focusDuration, focusIntention } = result;

        console.log("focusstart", focusStart);
        if (focusStart && focusDuration) {
          const elapsed = Math.floor((Date.now() - focusStart) / 1000);
          const totalSeconds = focusDuration * 60;
          const remaining = totalSeconds - elapsed;

          console.log("⏱ Remaining seconds:", remaining)
          if (remaining > 0) {
            setIntention(focusIntention || "");
            setTimer(focusDuration);
            setTimerActive(true);
            setTimeLeft(remaining);

            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
              timeRef.current -= 1;
              setTimeLeft(timeRef.current);
              if (timeRef.current <= 0) {
                clearInterval(intervalRef.current!);
                setTimerActive(false);
                chrome.storage.local.remove([
                  "focusStart",
                  "focusDuration",
                  "focusIntention",
                ]);
              }
            }, 1000);
          }
        }
      }
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

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
        <div style={{ marginBottom: 16 }}>
          <strong>Intention:</strong> <span>{intention}</span>
          <br />
          <strong>Time Left:</strong> <span>{formatTime(timeLeft)}</span>
        </div>
      ) : (
        <p style={{ marginBottom: 16 }}>No active focus session.</p>
      )}

      {/* You can optionally add stop/reset buttons here */}
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
