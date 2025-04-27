import React from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

function App() {
  const logoPath = chrome.runtime.getURL("icons/bearLogo.png");

  return (
    <div className="popup">
      {/* Header with logo + "YouTube" text */}
      <div className="popup-header">
        <img src={logoPath} alt="Logo" className="popup-logo" />
        <div className="popup-title">YouTube</div>
      </div>

      {/* Body content */}
      <div className="popup-body">
        <label htmlFor="intention">What is your intention here?</label>
        <input type="text" id="intention" placeholder="Enter your intention..." />

        <label htmlFor="minutes">Question 2: How long do you want to stay?</label>
        <div className="popup-duration-row">
          <span>Custom:</span>
          <input
            type="number"
            id="minutes"
            placeholder="minutes"
            className="popup-duration-input"
          />
        </div>
      </div>

      {/* Submit button */}
      <button className="popup-submit">Submit</button>
    </div>
  );
}

// Renders the App component into #root
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found!");
}