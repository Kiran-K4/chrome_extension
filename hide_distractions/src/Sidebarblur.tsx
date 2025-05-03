import React, { useEffect, useState } from "react";
import "./ToggleSwitch.css";

const SidebarBlurToggle: React.FC = () => {
  const [isBlurOn, setIsBlurOn] = useState(true);

  // Load saved state from localStorage when popup opens
  useEffect(() => {
    const saved = localStorage.getItem("focusbear_blur_enabled");
    if (saved !== null) {
      setIsBlurOn(saved === "true");
    }
  }, []);

  const handleToggle = () => {
    const newValue = !isBlurOn;
    setIsBlurOn(newValue);

    // Save to localStorage
    localStorage.setItem("focusbear_blur_enabled", String(newValue));

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "TOGGLE_BLUR",
          payload: newValue,
        });
      }
    });
  };

  return (
    <div className="toggle-container">
      <span className="toggle-label">Sidebar Blur</span>
      <label className="switch">
        <input type="checkbox" checked={isBlurOn} onChange={handleToggle} />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default SidebarBlurToggle;
