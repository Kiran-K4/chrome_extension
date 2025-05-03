console.log("Content script injected");

if (!document.getElementById("intention-popup-script")) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("floatingPopup.js");
  script.id = "intention-popup-script";
  script.type = "module";
  document.body.appendChild(script);
}

let focusTimer: ReturnType<typeof setTimeout> | null = null;
let isBlurEnabled = true;

// --- LISTEN FOR TOGGLE MESSAGE ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  if (type === "TOGGLE_BLUR") {
    isBlurEnabled = payload;
    console.log("[FocusBear] TOGGLE_BLUR received:", isBlurEnabled);

    if (isBlurEnabled) {
      applyBlurImmediately();
      sidebarObserver.observe(document.body, { childList: true, subtree: true });
      chipsObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      removeBlur();
      sidebarObserver.disconnect();
      chipsObserver.disconnect();
    }
  }
});


// --- BLUR FUNCTIONALITY ---

const applyBlurToSections = () => {
  const sectionsToBlur = document.querySelectorAll("ytd-guide-section-renderer");
  sectionsToBlur.forEach((section, index) => {
    if ([1, 2, 3].includes(index)) {
      const el = section as HTMLElement;
      el.style.filter = "blur(6px)";
      el.style.pointerEvents = "none";
      el.style.userSelect = "none";
    }
  });
};

const blurTopicChips = () => {
  const chipsBar = document.querySelector("ytd-feed-filter-chip-bar-renderer") as HTMLElement | null;
  if (chipsBar) {
    chipsBar.style.filter = "blur(6px)";
    chipsBar.style.pointerEvents = "none";
    chipsBar.style.userSelect = "none";
  }
};

const applyBlurImmediately = () => {
  applyBlurToSections();
  blurTopicChips();
};

const removeBlur = () => {
  document.querySelectorAll("ytd-guide-section-renderer").forEach((el) => {
    const elem = el as HTMLElement;
    elem.style.filter = "";
    elem.style.pointerEvents = "";
    elem.style.userSelect = "";
  });

  const chipsBar = document.querySelector("ytd-feed-filter-chip-bar-renderer") as HTMLElement | null;
  if (chipsBar) {
    chipsBar.style.filter = "";
    chipsBar.style.pointerEvents = "";
    chipsBar.style.userSelect = "";
  }
};

// --- MUTATION OBSERVERS ---
const sidebarObserver = new MutationObserver(() => {
  if (isBlurEnabled) applyBlurToSections();
});

const chipsObserver = new MutationObserver(() => {
  if (isBlurEnabled) blurTopicChips();
});

// --- INITIAL SETUP ---
if (isBlurEnabled) {
  applyBlurImmediately();
  sidebarObserver.observe(document.body, { childList: true, subtree: true });
  chipsObserver.observe(document.body, { childList: true, subtree: true });
}

// Remove any YouTube distractions
const selectorsToHide = ["#comments", ".sidebar", "ytd-watch-next-secondary-results-renderer"];
selectorsToHide.forEach((selector) => {
  const el = document.querySelector(selector);
  if (el) el.remove();
});
