console.log("Content script injected");

// Inject the popup if not already present
chrome.storage.local.get("intention", (result) => {
  if (!document.getElementById("intention-popup-script")) {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("floatingPopup.js");
    script.id = "intention-popup-script";
    script.type = "module";
    document.body.appendChild(script);
  }
});

// Messaging bridge between injected popup and chrome extension APIs
window.addEventListener("message", (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;

  if (event.data.type === "GET_INTENTION") {
    chrome.storage.local.get("intention", (result) => {
      window.postMessage({
        type: "SET_INTENTION",
        payload: result.intention || ""
      }, "*");
    });
  }

  if (event.data.type === "SAVE_INTENTION") {
    chrome.storage.local.set({ intention: event.data.payload });
  }
});

// Hiding distractions
const selectorsToHide = [
  '#comments',
  '.sidebar',
  'ytd-watch-next-secondary-results-renderer'
];

for (const selector of selectorsToHide) {
  const el = document.querySelector(selector);
  if (el) el.remove();
}
