import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  const [intention, setIntention] = useState("");
  const [time, setTime] = useState(0);

  // Simulate timer
  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Get initial intention
  useEffect(() => {
    window.postMessage({ type: "GET_INTENTION" }, "*");

    const handler = (event: MessageEvent) => {
      if (event.data.type === "SET_INTENTION") {
        setIntention(event.data.payload);
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleSave = () => {
    window.postMessage({ type: "SAVE_INTENTION", payload: intention }, "*");
    alert("Focus Block Intention saved!");
    document.getElementById("focus-popup")?.remove();
  };

  const handleCancel = () => {
    document.getElementById("focus-popup")?.remove();
  };

  return (
    <div id="focus-popup" style={overlayStyle}>
      <div style={popupStyle}>
        <img
          src="./bearLogo.png"
          alt="Focus Bear"
          style={{
            width: "80px",
            height: "80px",
            objectFit: "contain",
            marginBottom: "10px",
          }}
        />
        <h2 style={{ marginBottom: "18px", color: "#f58a07" }}>
          You are currretly accessing distraction site.
        </h2>
        <p style={{ fontWeight: "bold" }}>{`00:${time
          .toString()
          .padStart(2, "0")}`}</p>
        <p style={{ fontSize: "14px" }}>
          Can you share your intention to visit this site?
        </p>
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="Type your reason here..."
          style={textAreaStyle}
        />

        <div style={buttonContainerStyle}>
          <button
            onClick={handleCancel}
            style={{ ...buttonStyle, backgroundColor: "#f3c3a0" }}
          >
            Cancel
          </button>
          <button
            disabled={intention.trim().length < 5}
            onClick={handleSave}
            style={{
              ...buttonStyle,
              backgroundColor: intention.trim().length < 5 ? "#ccc" : "#f58a07",
              color: intention.trim().length < 5 ? "#666" : "#fff",
              cursor: intention.trim().length < 5 ? "not-allowed" : "pointer",
            }}
          >
            Proceed.
          </button>
        </div>
      </div>
    </div>
  );
};

// Styles
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

const popupStyle: React.CSSProperties = {
  padding: "30px",
  borderRadius: "12px",
  backgroundColor: "#fff",
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  textAlign: "center",
  maxWidth: "400px",
  width: "100%",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  marginTop: "10px",
  marginBottom: "20px",
  fontSize: "14px",
};
const textAreaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "80px",
  padding: "10px",
  marginTop: "10px",
  marginBottom: "20px",
  fontSize: "14px",
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
  cursor: "pointer",
  flex: 1,
};

const container = document.createElement("div");
document.body.appendChild(container);
const root = createRoot(container);
root.render(<App />);
