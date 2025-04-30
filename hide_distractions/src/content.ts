console.log("Content script injected");

/// to create the popup element if it is not existed.
if (!document.getElementById("intention-popup-script")) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("floatingPopup.js");
  script.id = "intention-popup-script";
  script.type = "module";
  document.body.appendChild(script);
}
let focusTimer: ReturnType<typeof setTimeout> | null = null;
// Messaging bridge between injected popup and chrome extension APIs
window.addEventListener("message", (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  if (event.data.type === "SAVE_INTENTION") {
    const intention = event.data.payload;

    // Send it to React app via event
    const customEvent = new CustomEvent("intention-saved", {
      detail: intention,
    });
    window.dispatchEvent(customEvent); // dispatching the event bact to react.
  }

  /// Function to handle the timer.
  if (event.data.type === "START_FOCUS_TIMER") {
    const durationInMinutes = event.data.payload;

    if (focusTimer) {
      clearTimeout(focusTimer);
    }

    console.log(`Starting focus timer for ${durationInMinutes} minutes.`);
    /// Sets the things to happen after the timeout.
    focusTimer = setTimeout(() => {
      console.log("Focus timer ended. Dispatching SHOW_POPUP event.");

      const event = new CustomEvent("show-popup-again");
      window.dispatchEvent(event); 
    }, durationInMinutes * 60 * 1000);
  }
});

// Hiding distractions
const selectorsToHide = [
  "#comments",
  ".sidebar",
  "ytd-watch-next-secondary-results-renderer",
];

for (const selector of selectorsToHide) {
  const el = document.querySelector(selector);
  if (el) el.remove();
}
