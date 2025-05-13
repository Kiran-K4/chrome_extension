import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { IntentionProvider } from "./context/intentionPopupContext";
import { useIntention } from "./context/intentionPopupContext";
import "./styles/intentionPopup.css";

const containerId = "focus-popup-container";
const IntentionPopup = () => {
  const { intention, setIntention, isIntentionSet } = useIntention();
  const [visible, setVisible] = useState(true);
  const { timer, setTimer } = useIntention();
  const [showWarning, setShowWarning] = useState(false);
  const [proceedDisabled, setProceedDisabled] = useState(true);

  console.log("Current Intention:", intention);
  console.log("Has Intention?", isIntentionSet);

  /// use effect to handle the event listeners.
  useEffect(() => {
    const handler = () => {
      console.log("Received show-popup-again event");
      setVisible(true);
    };
    window.addEventListener("show-popup-again", handler);

    return () => {
      window.removeEventListener("show-popup-again", handler);
    };
  }, []);

  /// use effect to check the proceed button validation whenever intention and timer changes.
  useEffect(() => {
    const trimmedIntention = intention.trim();
    const isShortIntention = trimmedIntention.length < 5;
    const isLongDuration = ["10", "15", "30"].includes(timer.toString());
    const needsDetailedIntention =
      isLongDuration && trimmedIntention.length < 15;

    const shouldDisable = !timer || isShortIntention || needsDetailedIntention;

    setProceedDisabled(shouldDisable);
  }, [intention, timer]);

  // Get initial intention
  useEffect(() => {
    const saved = sessionStorage.getItem("intention");
    if (saved) {
      setIntention(saved);
    }
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
          focusStart,
          focusDuration,
          focusIntention: intention,
        },
      },
      "*"
    );

    // Optional: update local sessionStorage if needed internally
    sessionStorage.setItem("intention", intention);
    sessionStorage.setItem("focusDuration", timer.toString());
    setVisible(false); /// sets popup visibility.
  };

  /// to handle the intention change.
  const handleIntentionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntention(e.target.value);
    validateIntentionLength(timer); /// validation to check the lenght of intention based on timer.
  };

  /// to handle the timer change.
  const handleDurationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setTimer(parseInt(selected, 10));
    validateIntentionLength(parseInt(selected, 10)); /// validation to check the lenght of intention based on timer.
  };

  // Validate if intention is short for long durations
  const validateIntentionLength = (selectedDuration: number) => {
    const minutes = selectedDuration;
    if (
      (minutes === 10 || minutes === 15 || minutes === 30) &&
      intention.trim().length < 15
    ) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };
  if (!visible) return null;

  return (
    <div id="focus-popup" style={overlayStyle}>
      <div style={popupBoxStyle}>
        <h2 style={{ marginBottom: "18px", color: "#f58a07" }}>
          You are currretly accessing distraction site.
        </h2>
        <p style={{ fontSize: "14px" }}>
          Can you share your intention to visit this site?
        </p>
        <textarea
          value={intention}
          onChange={handleIntentionChange}
          placeholder="Type your reason here..."
          style={inputStyle}
        />
        {showWarning && (
          <p style={{ color: "red", fontSize: "12px", marginBottom: "10px" }}>
            Please provide a more detailed explanation (at least 15 characters).
          </p>
        )}
        <p style={{ fontSize: "14px" }}>
          Please select how long you intend to stay on this site.
        </p>
        <select
          value={timer}
          onChange={handleDurationChange}
          style={inputStyle}
        >
          <option value="">Select focus time (minutes)</option>
          <option value="1">1 minute</option>
          <option value="5">5 minutes</option>
          <option value="10">10 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
        </select>

        <div style={buttonContainerStyle}>
          <button
            disabled={proceedDisabled} ///enable or disable  proceeed button based on the intetnion entered.
            onClick={handleSave}
            style={{
              ...buttonStyle,
              backgroundColor: proceedDisabled ? "#ccc" : "#f58a07",
              color: proceedDisabled ? "#666" : "#fff",
              cursor: proceedDisabled ? "not-allowed" : "pointer",
            }}
          >
            Proceed.
          </button>
        </div>
      </div>
    </div>
  );
};

if (!document.getElementById(containerId)) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(
    <IntentionProvider>
      <IntentionPopup />
    </IntentionProvider>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(255, 255, 255, 0.85)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  backdropFilter: "blur(4px)",
};

const popupBoxStyle: React.CSSProperties = {
  padding: "30px",
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
  maxWidth: "400px",
  width: "100%",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  margin: "10px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const buttonContainerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px 15px",
  border: "none",
  borderRadius: "6px",
  flex: 1,
};
