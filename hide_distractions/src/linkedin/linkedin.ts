console.log("LinkedIn blur script injected at", location.href);

// Blur "people you may know" toggle function
const togglePYMK = (on: boolean) => {
  document.querySelectorAll<HTMLElement>("section").forEach(sec => {
    if (/people you may know/i.test(sec.innerText) ||
      /People to follow based on your activity/i.test(sec.innerText) ||
      /People who are in/i.test(sec.innerText) ||
      /More suggestions for you/i.test(sec.innerText)
    ) {
      sec.style.cssText = on
        ? "filter:blur(8px)!important;pointer-events:none!important;user-select:none!important;"
        : "";
    }
  });
};

// Stored setting on load
chrome.storage.local.get(
  { linkedinBlurPYMK: true },
  ({ linkedinBlurPYMK }) => togglePYMK(linkedinBlurPYMK)
);

// Re-apply if LinkedIn lazy-injects more sections
new MutationObserver(muts => {
  if (muts.some(m => m.addedNodes.length)) {
    chrome.storage.local.get(
      { linkedinBlurPYMK: true },
      ({ linkedinBlurPYMK }) => togglePYMK(linkedinBlurPYMK)
    );
  }
}).observe(document.body, { childList: true, subtree: true });

// Listen for popup’s toggle
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg.type === "TOGGLE_LINKEDIN_BLUR") {
    togglePYMK(!!msg.payload);
    sendResponse({ ok: true });
  }
});
