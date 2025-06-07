console.log("LinkedIn blur script injected at", location.href);

// Blur "people you may know" toggle function
const togglePYMK = (on: boolean) => {
  document.querySelectorAll<HTMLElement>("section").forEach(sec => {
    if (/people you may know/i.test(sec.innerText) ||
      /People to follow based on your activity/i.test(sec.innerText) ||
      /People who are in/i.test(sec.innerText) ||
      /People in the/i.test(sec.innerText) ||
      /More suggestions for you/i.test(sec.innerText)
    ) {
      sec.style.cssText = on
        ? "filter:blur(8px)!important;pointer-events:none!important;user-select:none!important;"
        : "";
    }
  });
};

// Blur/Un-blur "LinkedIn News" sections (Trending News)
const toggleNews = (on: boolean) => {
  // "LinkedIn News" widget typically appears as a <section> containing that heading
  document.querySelectorAll<HTMLElement>("section").forEach(sec => {
    // Look for "LinkedIn News" or "Top stories" in the section's innerText
    if (
      /LinkedIn News/i.test(sec.innerText) ||
      /Top stories/i.test(sec.innerText)
    ) {
      sec.style.cssText = on
        ? "filter:blur(8px)!important;pointer-events:none!important;user-select:none!important;"
        : "";
    }
  });
};

// Blur/Un-blur LinkedIn Home Section
const toggleHomeSection = (on: boolean) => {
  const feedContainer = document.querySelector<HTMLElement>(".scaffold-finite-scroll__content");
  if (feedContainer) {
    feedContainer.style.cssText = on
      ? "filter:blur(8px)!important;pointer-events:none!important;user-select:none!important;"
      : "";
  }
};

// Stored setting on load
chrome.storage.local.get(
  { linkedinBlurPYMK: true, linkedinBlurNews: true, linkedinHomeSection: true },
  ({ linkedinBlurPYMK, linkedinBlurNews, linkedinHomeSection }) => {
    togglePYMK(linkedinBlurPYMK);
    toggleNews(linkedinBlurNews);
    toggleHomeSection(linkedinHomeSection);
  }
);

// Re-apply if LinkedIn lazy-injects more sections
new MutationObserver((mutations) => {
  if (mutations.some((m) => m.addedNodes.length)) {
    chrome.storage.local.get(
      { linkedinBlurPYMK: true, linkedinBlurNews: true, linkedinHomeSection: true },
      ({ linkedinBlurPYMK, linkedinBlurNews, linkedinHomeSection }) => {
        togglePYMK(linkedinBlurPYMK);
        toggleNews(linkedinBlurNews);
        toggleHomeSection(linkedinHomeSection);
      }
    );
  }
}).observe(document.body, { childList: true, subtree: true });

// Listen for popup's toggle
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg.type === "TOGGLE_LINKEDIN_BLUR") {
    togglePYMK(!!msg.payload);
    sendResponse({ ok: true });
  }
  else if (msg.type === "TOGGLE_LINKEDIN_NEWS") {
    toggleNews(!!msg.payload);
    sendResponse({ ok: true });
  }
  else if (msg.type === "TOGGLE_LINKEDIN_HOME_SECTION") {
    toggleHomeSection(!!msg.payload);
    sendResponse({ ok: true });
  }
});
