console.log("LinkedIn blur script injected at", location.href);

const FILTER_CSS = 
  "filter:blur(8px)!important;pointer-events:none!important;user-select:none!important;";

// match any of the panels you want to hide
const PANEL_RE = /people you may know|popular on linkedin|people to follow based on your activity|more suggestions for you/i;

const toggleSections = (on: boolean) => {
  document.querySelectorAll<HTMLElement>("section").forEach(sec => {
    if (PANEL_RE.test(sec.innerText)) {
      sec.style.cssText = on ? FILTER_CSS : "";
    }
  });
};

// 1) honour stored setting on load
chrome.storage.local.get(
  { linkedinBlurPYMK: true },
  ({ linkedinBlurPYMK }) => toggleSections(linkedinBlurPYMK)
);

// 2) re-apply if LinkedIn lazy-injects more sections
new MutationObserver(muts => {
  if (muts.some(m => m.addedNodes.length)) {
    chrome.storage.local.get(
      { linkedinBlurPYMK: true },
      ({ linkedinBlurPYMK }) => toggleSections(linkedinBlurPYMK)
    );
  }
}).observe(document.body, { childList: true, subtree: true });

// 3) listen for your popup’s toggle
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg.type === "TOGGLE_LINKEDIN_BLUR") {
    toggleSections(!!msg.payload);
    sendResponse({ ok: true });
  }
});