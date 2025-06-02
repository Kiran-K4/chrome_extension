console.log("LinkedIn blur script injected at", location.href);

// single toggle function
const togglePYMK = (on: boolean) => {
  document.querySelectorAll<HTMLElement>("section").forEach(sec => {
    if (/people you may know/i.test(sec.innerText)) {
      sec.style.cssText = on
        ? "filter:blur(8px)!important;pointer-events:none!important;user-select:none!important;"
        : "";
    }
  });
};

// 1) honour stored setting on load
chrome.storage.local.get(
  { linkedinBlurPYMK: true },
  ({ linkedinBlurPYMK }) => togglePYMK(linkedinBlurPYMK)
);

// 2) re-apply if LinkedIn lazy-injects more sections
new MutationObserver(muts => {
  if (muts.some(m => m.addedNodes.length)) {
    chrome.storage.local.get(
      { linkedinBlurPYMK: true },
      ({ linkedinBlurPYMK }) => togglePYMK(linkedinBlurPYMK)
    );
  }
}).observe(document.body, { childList: true, subtree: true });

// 3) listen for your popup’s toggle
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg.type === "TOGGLE_LINKEDIN_BLUR") {
    togglePYMK(!!msg.payload);
    sendResponse({ ok: true });
  }
});