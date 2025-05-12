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
let isHomePageBlurEnabled = true;

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

const blurHomePage = () => {
  // Target the video grid content with multiple possible selectors
  const mainContent = document.querySelector('ytd-rich-grid-renderer #contents, #primary ytd-rich-grid-renderer #contents') as HTMLElement | null;
  const primaryContent = document.querySelector('ytd-rich-grid-renderer, #primary ytd-rich-grid-renderer') as HTMLElement | null;
  
  if (mainContent && primaryContent) {
    // Create a stacking context for the video grid
    primaryContent.style.position = 'relative';
    primaryContent.style.zIndex = '0';
    
    // Apply blur only to the video grid
    mainContent.style.filter = "blur(25px)";
    mainContent.style.pointerEvents = "none";
    mainContent.style.userSelect = "none";
    mainContent.style.opacity = "0.8";
    mainContent.style.marginTop = "10px";
  }
};

const removeHomePageBlur = () => {
  const mainContent = document.querySelector('ytd-rich-grid-renderer #contents, #primary ytd-rich-grid-renderer #contents') as HTMLElement | null;
  const primaryContent = document.querySelector('ytd-rich-grid-renderer, #primary ytd-rich-grid-renderer') as HTMLElement | null;
  
  if (mainContent && primaryContent) {
    mainContent.style.filter = "";
    mainContent.style.pointerEvents = "";
    mainContent.style.userSelect = "";
    mainContent.style.opacity = "";
    mainContent.style.marginTop = "";
    
    primaryContent.style.position = "";
    primaryContent.style.zIndex = "";
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

const homePageObserver = new MutationObserver(() => {
  if (isHomePageBlurEnabled) {
    const mainContent = document.querySelector('ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer');
    if (mainContent) {
      blurHomePage();
    }
  }
});

// Add message handler for home page blur toggle
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

  // Add new handler for home page blur
  if (type === "TOGGLE_HOME_PAGE_BLUR") {
    isHomePageBlurEnabled = payload;
    chrome.storage.local.set({ homePageBlurEnabled: isHomePageBlurEnabled });

    if (isHomePageBlurEnabled) {
      blurHomePage();
      homePageObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      removeHomePageBlur();
      homePageObserver.disconnect();
    }
  }
});

// Update the storage getter to include home page blur
chrome.storage.local.get({ 
  blurEnabled: true,
  homePageBlurEnabled: true 
}, ({ blurEnabled, homePageBlurEnabled }) => {
  isBlurEnabled = blurEnabled;
  isHomePageBlurEnabled = homePageBlurEnabled;

  if (isBlurEnabled) {
    applyBlurImmediately();
    sidebarObserver.observe(document.body, { childList: true, subtree: true });
    chipsObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Initialize home page blur if enabled
  if (homePageBlurEnabled) {
    blurHomePage();
    homePageObserver.observe(document.body, { childList: true, subtree: true });
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
