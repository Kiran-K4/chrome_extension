console.log("Content script injected");

const STYLE_ID = 'focus-bear-hide-comments-style';
const selectorsToHide = [
  '#comments',
  'ytd-item-section-renderer[static-comments-header]',
  '#continuations',      
  '.sidebar',
  // 'ytd-watch-next-secondary-results-renderer'
];

// Inject floatingPopup if not already present
if (!document.getElementById("intention-popup-script")) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("floatingPopup.js");
  script.id = "intention-popup-script";
  script.type = "module";
  document.body.appendChild(script);
}

let focusTimer: ReturnType<typeof setTimeout> | null = null;
let isBlurEnabled = true;

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  // Save intention (sent from popup to content)
  if (event.data.type === "SAVE_INTENTION") {
    const intention = event.data.payload;
    const customEvent = new CustomEvent("intention-saved", { detail: intention });
    window.dispatchEvent(customEvent);
  }

  // Start timer and dispatch event when finished
  if (event.data.type === "START_FOCUS_TIMER") {
    const durationInMinutes = event.data.payload;

    if (focusTimer) clearTimeout(focusTimer);

    console.log(`Starting focus timer for ${durationInMinutes} minutes.`);
    focusTimer = setTimeout(() => {
      console.log("Focus timer ended. Dispatching SHOW_POPUP event.");
      window.dispatchEvent(new CustomEvent("show-popup-again"));
    }, durationInMinutes * 60 * 1000);
  }
});

for (const selector of selectorsToHide) {
  const el = document.querySelector(selector);
  if (el) el.remove();
}
const applyBlurToSections = () => {
  const sections = document.querySelectorAll("ytd-guide-section-renderer");
  sections.forEach((section, index) => {
    if ([1, 2, 3].includes(index)) {
      const el = section as HTMLElement;
      el.style.filter = "blur(6px)";
      el.style.pointerEvents = "none";
      el.style.userSelect = "none";
    }
  });
};

const blurChipsBar = () => {
  const chips = document.querySelector("ytd-feed-filter-chip-bar-renderer") as HTMLElement | null;
  if (chips) {
    const height = chips.offsetHeight;

    chips.style.filter = "blur(6px)";
    chips.style.pointerEvents = "none";
    chips.style.userSelect = "none";
    chips.style.height = `${height}px`;
    chips.style.position = "relative";
    chips.style.overflow = "hidden";
    chips.style.display = "block";
    chips.style.boxSizing = "border-box";
  }
};

const removeBlur = () => {
  document.querySelectorAll("ytd-guide-section-renderer").forEach((el) => {
    const elem = el as HTMLElement;
    elem.style.filter = "";
    elem.style.pointerEvents = "";
    elem.style.userSelect = "";
  });

  const chips = document.querySelector("ytd-feed-filter-chip-bar-renderer") as HTMLElement | null;
  if (chips) {
    chips.style.filter = "";
    chips.style.pointerEvents = "";
    chips.style.userSelect = "";
    chips.style.height = "";
    chips.style.position = "";
    chips.style.overflow = "";
    chips.style.display = "";
    chips.style.boxSizing = "";
  }
};

const applyBlurImmediately = () => {
  applyBlurToSections();
  blurChipsBar();
};


const sidebarObserver = new MutationObserver(() => {
  if (isBlurEnabled) applyBlurToSections();
});
const chipsObserver = new MutationObserver(() => {
  if (isBlurEnabled) blurChipsBar();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  if (type === "TOGGLE_BLUR") {
    isBlurEnabled = payload;
    chrome.storage.local.set({ blurEnabled: isBlurEnabled });

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

chrome.storage.local.get({ blurEnabled: true }, ({ blurEnabled }) => {
  isBlurEnabled = blurEnabled;

  if (isBlurEnabled) {
    applyBlurImmediately();
    sidebarObserver.observe(document.body, { childList: true, subtree: true });
    chipsObserver.observe(document.body, { childList: true, subtree: true });
  }
});

// Hide everything matching our selectors
function applyHide() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = selectorsToHide
    .map(sel => `${sel} { display: none !important; }`)
    .join('\n');
  document.head.appendChild(style);
}

// remove that <style>, showing them again
function applyShow() {
  const style = document.getElementById(STYLE_ID);
  if (style) style.remove();
}

// on page load, read storage and hide if needed
const commentsObserver = new MutationObserver(() => {
  chrome.storage.local.get('commentsHidden', ({ commentsHidden }) => {
    if (commentsHidden) applyHide();
  });
});
commentsObserver.observe(document.body, { childList: true, subtree: true });

// listen for your popup toggle
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'toggleComments') {
    // read current
    chrome.storage.local.get({ commentsHidden: false }, ({ commentsHidden }) => {
      const nowHidden = !commentsHidden;
      if (nowHidden) applyHide();
      else applyShow();
      // save and reply
      chrome.storage.local.set({ commentsHidden: nowHidden }, () => {
        sendResponse({ status: nowHidden ? 'hidden' : 'shown' });
      });
    });
    return true;
  }
});
