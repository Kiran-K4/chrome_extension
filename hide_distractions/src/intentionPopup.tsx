import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { IntentionProvider } from "./context/intentionPopupContext";
import { useIntention } from "./context/intentionPopupContext";
import "./styles/intentionPopup.css";
import iconUrl from "../public/icons/bearLogo.png";

console.log("intentionPopup.tsx loaded");

const containerId = "focus-popup-container";

const IntentionPopup = () => {
  const { intention, setIntention, isIntentionSet } = useIntention();
  const { timer, setTimer } = useIntention();
  const [visible, setVisible] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  const [proceedDisabled, setProceedDisabled] = useState(true);
  const [localizedText, setLocalizedText] = useState<any | null>(null);

  useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.source !== window) return;
    if (event.data.type === "FOCUSBEAR_TRANSLATIONS") {
      console.log("Received translations:", event.data.payload);
      setLocalizedText(event.data.payload);
    }
  };
  window.addEventListener("message", handleMessage);

  //Request translations if not received after short delay
  const timeout = setTimeout(() => {
    if (!localizedText) {
      console.log("📡 No translations received, requesting again...");
      window.postMessage({ type: "REQUEST_TRANSLATIONS" }, "*");
    }
  }, 300); // Adjust delay if needed

  return () => {
    window.removeEventListener("message", handleMessage);
    clearTimeout(timeout);
  };
}, []);


  useEffect(() => {
    const handler = () => {
      console.log("show-popup-again received");
      setVisible(true);
    };
    window.addEventListener("show-popup-again", handler);
    return () => window.removeEventListener("show-popup-again", handler);
  }, []);

  // use effect to check the proceed button validation whenever intention and timer changes.
  useEffect(() => {
    const trimmedIntention = intention.trim();
    const isShortIntention = trimmedIntention.length < 5;
    const isLongDuration = ["10", "15", "30"].includes(timer.toString());
    const needsDetailedIntention =
      isLongDuration && trimmedIntention.length < 15;

    const shouldDisable = !timer || isShortIntention || needsDetailedIntention;
    setProceedDisabled(shouldDisable);
  }, [intention, timer]);

  // ───── INIT_INTENTION_DATA listener ─────
  useEffect(() => {
    function handleInit(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.data?.type !== "INIT_INTENTION_DATA") return;

      const { lastIntention, lastFocusDuration } = event.data.payload;
      if (lastIntention)   setIntention(lastIntention);
      if (typeof lastFocusDuration === "number") setTimer(lastFocusDuration);
      setVisible(true);
    }

    window.addEventListener("message", handleInit);
    return () => {
      window.removeEventListener("message", handleInit);
    };
  }, []);
/// to handle the intention save fucntionality
  const handleSave = () => {
    const focusDuration = timer;
    const focusStart = Date.now();
    // Send to content script to store in chrome.storage.local
    window.postMessage(
      {
        type: "STORE_FOCUS_DATA",
        payload: {
    domain: window.location.hostname,
          focusStart,
          focusDuration,
          focusIntention: intention,
        },
      },
      "*"
    );
    window.postMessage(
      { type: "START_FOCUS_TIMER", payload: timer },
      "*"
    );
    
    setVisible(false); // sets popup visibility.
  };

   /// to handle the intention change.
  // to handle the intention change.
  const handleIntentionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntention(e.target.value);
    validateIntentionLength(timer); // validation to check the lenght of intention based on timer.
  };

  // to handle the timer change.
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setTimer(parseInt(selected, 10));
    validateIntentionLength(parseInt(selected, 10)); // validation to check the lenght of intention based on timer.
  };

  const validateIntentionLength = (selectedDuration: number) => {
    const minutes = selectedDuration;
    if (
      (selectedDuration === 10 ||
        selectedDuration === 15 ||
        selectedDuration === 30) &&
      intention.trim().length < 15
    ) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  if (!visible || !localizedText) {
    console.warn("Waiting for translations or popup not visible");
    return null;
  }

  return (
    <div id="focus-popup" className="focus-popup">
      <div className="focus-popup-box">
        <img src={iconUrl} alt="Focus Mode Icon" className="focus-logo" />
        <h2>{localizedText.heading}</h2>
        <p>{localizedText.prompt}</p>
        <textarea
          value={intention}
          onChange={handleIntentionChange}
          placeholder={localizedText.placeholder}
          className="focus-input"
        />
        {showWarning && (
          <p className="focus-warning">{localizedText.warning}</p>
        )}
        <p>{localizedText.duration}</p>
        <select
          value={timer}
          onChange={handleDurationChange}
          className="focus-input"
        >
          <option value="">{localizedText.time_default}</option>
          <option value="1">{localizedText.minute_1}</option>
          <option value="5">{localizedText.minute_5}</option>
          <option value="10">{localizedText.minute_10}</option>
          <option value="15">{localizedText.minute_15}</option>
          <option value="30">{localizedText.minute_30}</option>
        </select>

        <div className="focus-button-container">
          <button
            disabled={proceedDisabled}
            onClick={handleSave}
            className="focus-button"
          >
            {localizedText.button}
          </button>
        </div>
      </div>
    </div>
  );
};

//Inject React popup
if (!document.getElementById(containerId)) {
  console.log("Mounting React root to container");

  const container = document.createElement("div");
  container.id = containerId;
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <IntentionProvider>
      <IntentionPopup />
    </IntentionProvider>
  );
} else {
  console.log("Popup already exists, skipping injection");
}
