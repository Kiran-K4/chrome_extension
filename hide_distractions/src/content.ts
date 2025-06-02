console.log("Content script injected");

const COMMENT_BLUR_ID = "focus-bear-comment-blur-style";
const selectorsToHide = [
  "#comments",
  "ytd-item-section-renderer[static-comments-header]",
  "#continuations",
  ".sidebar",
  // 'ytd-watch-next-secondary-results-renderer'
];

// Inject floatingPopup if not already present
// 1) At the very top, to confirm the script is running and on which page:
console.log("[Content] script loaded at URL:", location.href);

// 2) Before you even call storage.get:
console.log("[Content] about to read showIntentionPopup flag…");
chrome.storage.local.get(
  { showIntentionPopup: true, lastIntention: "", lastFocusDuration: 0 },
  ({ showIntentionPopup, lastIntention, lastFocusDuration }) => {
    // 3) Immediately after the storage read returns:
    console.log(
      "[Content] storage.get returned:",
      { showIntentionPopup, lastIntention, lastFocusDuration }
    );

    if (!showIntentionPopup) {
      console.log("[Content] showIntentionPopup is false → skipping injection");
      return;
    }

    // 4) Check for an existing script tag:
    const existing = !!document.getElementById("intention-popup-script");
    console.log("[Content] intention-popup-script already on page?", existing);

    if (!existing) {
      console.log("[Content] injecting floatingPopup.js…");
      const script = document.createElement("script");
      script.src  = chrome.runtime.getURL("floatingPopup.js");
      script.id   = "intention-popup-script";
      script.type = "module";

      script.onload = () => {
        console.log("[Content] floatingPopup.js loaded, posting INIT_INTENTION_DATA", {
          lastIntention, lastFocusDuration
        });
        window.postMessage({
          type: "INIT_INTENTION_DATA",
          payload: { lastIntention, lastFocusDuration }
        }, "*");
      };

      document.body.appendChild(script);
    }
  }
);

// 2) **New: schedule the timer in this tab on load**
chrome.storage.local.get(
  ["focusStart", "focusDuration", "showIntentionPopup"],
  ({ focusStart, focusDuration, showIntentionPopup }) => {
    if (focusStart && focusDuration && !showIntentionPopup) {
      const elapsed   = Date.now() - focusStart;
      const totalMs   = focusDuration * 60 * 1000;
      const remaining = totalMs - elapsed;

      if (remaining > 0) {
        console.log(`[Content] Scheduling re-popup in ${remaining}ms`);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("show-popup-again"));
        }, remaining);
      } else {
        console.log("[Content] Timer already expired — showing popup now");
        window.dispatchEvent(new CustomEvent("show-popup-again"));
      }
    }
  }
);

// 5) In your show-popup-again listener, to see if you ever get this event:
window.addEventListener("show-popup-again", () => {
  console.log("[Content] show-popup-again event fired, attempting reinjection…");
});


let focusTimer: ReturnType<typeof setTimeout> | null = null;
let isBlurEnabled = true;

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data.type === "SAVE_INTENTION") {
    const intention = event.data.payload;
    const customEvent = new CustomEvent("intention-saved", {
      detail: intention,
    });
    window.dispatchEvent(customEvent);
  }

 
  if (event.data.type === "STORE_FOCUS_DATA") {
    const { focusStart, focusDuration, focusIntention } = event.data.payload;
    chrome.storage.local.set(
      {
        focusStart,
        focusDuration,
        focusIntention,
        showIntentionPopup: false,
        lastIntention: focusIntention,
        lastFocusDuration: focusDuration
      },
      () => {
        console.log("✅ Stored focus session & hid popup permanently");

        // ─── schedule the popup in this tab right now ───
        const elapsed   = Date.now() - focusStart;
        const totalMs   = focusDuration * 60 * 1000;
        const remaining = totalMs - elapsed;

        if (remaining > 0) {
          console.log(`[Content] [STORE] Scheduling re-popup in ${remaining}ms`);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("show-popup-again"));
          }, remaining);
        } else {
          console.log("[Content] [STORE] Timer already expired; showing now");
          window.dispatchEvent(new CustomEvent("show-popup-again"));
        }
      }
    );
  }

});

for (const selector of selectorsToHide) {
  const el = document.querySelector(selector);
  if (el) el.remove();
}

const blurTopSubscriptionsMenu = () => {
  const subLink = Array.from(document.querySelectorAll("ytd-guide-entry-renderer"))
    .find(el => el.textContent?.trim().toLowerCase() === "subscriptions") as HTMLElement | undefined;

  if (subLink) {
    subLink.style.filter = "blur(6px)";
    subLink.style.pointerEvents = "none";
    subLink.style.userSelect = "none";
    subLink.style.background = "transparent"; // Removes hover highlight
  }
};

const unblurTopSubscriptionsMenu = () => {
  const subLink = Array.from(document.querySelectorAll("ytd-guide-entry-renderer"))
    .find(el => el.textContent?.trim().toLowerCase() === "subscriptions") as HTMLElement | undefined;

  if (subLink) {
    subLink.style.filter = "none";
    subLink.style.pointerEvents = "auto";
    subLink.style.userSelect = "auto";
    subLink.style.background = ""; // Reset background
  }
};

const blurLeftIconSubscriptions = () => {
  const miniSub = Array.from(document.querySelectorAll("ytd-mini-guide-entry-renderer"))
    .find(el => el.getAttribute("aria-label")?.toLowerCase() === "subscriptions") as HTMLElement | undefined;

  if (miniSub) {
    miniSub.style.filter = "blur(6px)";
    miniSub.style.pointerEvents = "none";
    miniSub.style.userSelect = "none";
    miniSub.style.background = "transparent";
  } else {
    console.log("[DEBUG] Mini Subscriptions not found");
  }
};

const unblurLeftIconSubscriptions = () => {
  const miniSub = Array.from(document.querySelectorAll("ytd-mini-guide-entry-renderer"))
    .find(el => el.getAttribute("aria-label")?.toLowerCase() === "subscriptions") as HTMLElement | undefined;

  if (miniSub) {
    miniSub.style.filter = "";
    miniSub.style.pointerEvents = "";
    miniSub.style.userSelect = "";
    miniSub.style.background = "";
  }
};

const blurShortsMenu = () => {
  const shorts = Array.from(
    document.querySelectorAll("ytd-guide-entry-renderer")
  ).find((el) => el.textContent?.trim().toLowerCase() === "shorts") as
    | HTMLElement
    | undefined;

  if (shorts) {
    shorts.style.filter = "blur(6px)";
    shorts.style.pointerEvents = "none";
    shorts.style.userSelect = "none";
  }
};
const unblurShortsMenu = () => {
  const shorts = Array.from(
    document.querySelectorAll("ytd-guide-entry-renderer")
  ).find((el) => el.textContent?.trim().toLowerCase() === "shorts") as
    | HTMLElement
    | undefined;

  if (shorts) {
    shorts.style.filter = "none";
    shorts.style.pointerEvents = "auto";
    shorts.style.userSelect = "auto";
  }
};

const isShortsPage = () => {
  return window.location.pathname.startsWith("/shorts/");
};

const blurShortsPage = () => {
  const shortsRoot = document.querySelector(
    "ytd-reel-video-renderer, #shorts-container, .reel-video-renderer"
  ) as HTMLElement | null;
  if (shortsRoot) {
    shortsRoot.style.filter = "blur(8px)";
    shortsRoot.style.pointerEvents = "none";
    shortsRoot.style.userSelect = "none";
  }
};

const unblurShortsPage = () => {
  const shortsRoot = document.querySelector(
    "ytd-reel-video-renderer, #shorts-container, .reel-video-renderer"
  ) as HTMLElement | null;
  if (shortsRoot) {
    shortsRoot.style.filter = "none";
    shortsRoot.style.pointerEvents = "auto";
    shortsRoot.style.userSelect = "auto";
  }
};

const blurShortsShelf = () => {
  const possibleShortsBlocks = document.querySelectorAll(`
    ytd-rich-section-renderer,
    ytd-reel-shelf-renderer,
    ytd-grid-video-renderer,
    ytd-video-renderer
  `);

  possibleShortsBlocks.forEach((block) => {
    const text = block.textContent?.toLowerCase() ?? "";

    if (text.includes("#shorts") || text.includes("shorts")) {
      const el = block as HTMLElement;
      el.style.filter = "blur(6px)";
      el.style.pointerEvents = "none";
      el.style.userSelect = "none";
    }
  });
};
const unblurShortsShelf = () => {
  const possibleShortsBlocks = document.querySelectorAll(`
    ytd-rich-section-renderer,
    ytd-reel-shelf-renderer,
    ytd-grid-video-renderer,
    ytd-video-renderer
  `);

  possibleShortsBlocks.forEach((block) => {
    const text = block.textContent?.toLowerCase() ?? "";

    if (text.includes("#shorts") || text.includes("shorts")) {
      const el = block as HTMLElement;
      el.style.filter = "none";
      el.style.pointerEvents = "auto";
      el.style.userSelect = "auto";
    }
  });
};

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
  blurTopSubscriptionsMenu();
  blurLeftIconSubscriptions(); 
};

const blurChipsBar = () => {
  const chips = document.querySelector(
    "ytd-feed-filter-chip-bar-renderer"
  ) as HTMLElement | null;
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

  const chips = document.querySelector(
    "ytd-feed-filter-chip-bar-renderer"
  ) as HTMLElement | null;
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
  unblurTopSubscriptionsMenu();
  unblurLeftIconSubscriptions();
};

const applyBlurImmediately = () => {
  applyBlurToSections();
  blurChipsBar();
  blurShortsMenu();
  blurShortsShelf();
  if (isShortsPage()) {
    blurShortsPage();
  }
  blurTopSubscriptionsMenu();
  blurLeftIconSubscriptions();
};

const sidebarObserver = new MutationObserver(() => {
  chrome.storage.local.get({ blurEnabled: true }, ({ blurEnabled }) => {
    if (blurEnabled) applyBlurToSections();
    else removeBlur();  // optional cleanup
  });
});

const chipsObserver = new MutationObserver(() => {
  chrome.storage.local.get({ blurEnabled: true }, ({ blurEnabled }) => {
    if (blurEnabled) blurChipsBar();
    else removeBlur();  // if such a function exists
  });
});
const shortsmenuObserver = new MutationObserver(() => {
  chrome.storage.local.get(
    { shortsBlurEnabled: true },
    ({ shortsBlurEnabled }) => {
      if (shortsBlurEnabled) blurShortsMenu();
      else unblurShortsMenu();
    }
  );
});
const subscriptionsMenuObserver = new MutationObserver(() => {
  if (isBlurEnabled) {
    blurTopSubscriptionsMenu();
  } else {
    unblurTopSubscriptionsMenu();
  }
});

const miniGuideObserver = new MutationObserver(() => {
  setTimeout(() => {
    if (isBlurEnabled) {
      blurLeftIconSubscriptions();
    } else {
      unblurLeftIconSubscriptions();
    }
  }, 100); // ⏱ small delay ensures the DOM element is ready
});

const shortspageObserver = new MutationObserver(() => {
  chrome.storage.local.get(
    { shortsBlurEnabled: true },
    ({ shortsBlurEnabled }) => {
      if (isShortsPage()) {
        if (shortsBlurEnabled) blurShortsPage();
        else unblurShortsPage();
      }
    }
  );
});
const shortsshelfObserver = new MutationObserver(() => {
  chrome.storage.local.get(
    { shortsBlurEnabled: true },
    ({ shortsBlurEnabled }) => {
      if (shortsBlurEnabled) blurShortsShelf();
      else unblurShortsShelf();
    }
  );
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  if (type === "TOGGLE_BLUR") {
    isBlurEnabled = payload;
    chrome.storage.local.set({ blurEnabled: isBlurEnabled });

    if (isBlurEnabled) {
      applyBlurImmediately();
      sidebarObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
      chipsObserver.observe(document.body, { childList: true, subtree: true });
    } else {
      removeBlur();
      sidebarObserver.disconnect();
      chipsObserver.disconnect();
    }
  }
});

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (event.data.type === "SAVE_INTENTION") {
    const intention = event.data.payload;
    const customEvent = new CustomEvent("intention-saved", {
      detail: intention,
    });
    window.dispatchEvent(customEvent);
  }

  if (event.data.type === "START_FOCUS_TIMER") {
    const durationInMinutes = event.data.payload;

    if (focusTimer) clearTimeout(focusTimer);

    console.log(`Starting focus timer for ${durationInMinutes} minutes.`);
    focusTimer = setTimeout(() => {
      console.log("Focus timer ended. Dispatching SHOW_POPUP event.");
      window.dispatchEvent(new CustomEvent("show-popup-again"));
    }, durationInMinutes * 60 * 1000);
  }

  // NEW: Save focus data to chrome.storage.local
  if (event.data.type === "STORE_FOCUS_DATA") {
    const { focusStart, focusDuration, focusIntention } = event.data.payload;
    const domain = window.location.hostname;
console.log(`domain: ${domain}`);
    // Fetch existing focus data
    chrome.storage.local.get(["focusData"], (result) => {
      const focusData = result.focusData || {};

      // Save new data under domain key
      focusData[domain] = {
        focusStart,
        focusDuration,
        focusIntention,
      };

      // Store updated focusData
      chrome.storage.local.set({ focusData }, () => {
        console.log(
          `Stored focus session for ${domain} in chrome.storage.local`
        );
      });
    });
  }
});

chrome.storage.local.get({ blurEnabled: true }, ({ blurEnabled }) => {
  isBlurEnabled = blurEnabled;

  if (isBlurEnabled) {
    applyBlurImmediately();
  }
  sidebarObserver.observe(document.body, { childList: true, subtree: true });
  chipsObserver.observe(document.body, { childList: true, subtree: true });
  shortsmenuObserver.observe(document.body, { childList: true, subtree: true });
  shortsshelfObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
  shortspageObserver.observe(document.body, { childList: true, subtree: true });
  subscriptionsMenuObserver.observe(document.body, { childList: true, subtree: true });
  miniGuideObserver.observe(document.body, { childList: true, subtree: true });

});

// Blur comments
function applyCommentBlur() {
  if (document.getElementById(COMMENT_BLUR_ID)) return;
  const style = document.createElement("style");
  style.id = COMMENT_BLUR_ID;
  style.textContent = selectorsToHide
    .map(
      (sel) => `
      ${sel} {
        filter: blur(6px) !important;
        pointer-events: none !important;
        user-select: none !important;
      }
    `
    )
    .join("\n");
  document.head.appendChild(style);
}

function removeCommentBlur() {
  const style = document.getElementById(COMMENT_BLUR_ID);
  if (style) style.remove();
}

// on page load, read storage and blur if needed
const commentsObserver = new MutationObserver(() => {
  chrome.storage.local.get("commentsHidden", ({ commentsHidden }) => {
    if (commentsHidden) applyCommentBlur();
  });
});
commentsObserver.observe(document.body, { childList: true, subtree: true });

// listen for your popup toggle
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === "toggleComments") {
    chrome.storage.local.get(
      { commentsHidden: false },
      ({ commentsHidden }) => {
        const nowHidden = !commentsHidden;
        if (nowHidden) applyCommentBlur();
        else removeCommentBlur();
        chrome.storage.local.set({ commentsHidden: nowHidden }, () => {
          sendResponse({ status: nowHidden ? "hidden" : "shown" });
        });
      }
    );
    return true;
  }
});

window.addEventListener("show-popup-again", () => {
  // fetch only the data we need for pre-filling the form:
  chrome.storage.local.get(
    ["lastIntention", "lastFocusDuration"],
    ({ lastIntention, lastFocusDuration }) => {
      // never inject twice
      if (document.getElementById("intention-popup-script")) {
        return;
      }

      // inject the popup script
      const script = document.createElement("script");
      script.src  = chrome.runtime.getURL("floatingPopup.js");
      script.id   = "intention-popup-script";
      script.type = "module";

      script.onload = () => {
        // send it its saved data
        window.postMessage({
          type: "INIT_INTENTION_DATA",
          payload: { lastIntention, lastFocusDuration },
        }, "*");
      };

      document.body.appendChild(script);
    }
  );
});


function applyShortsToggle(shouldBlur: boolean) {
  if (shouldBlur) {
    blurShortsMenu();
    if (isShortsPage()) blurShortsPage();
    blurShortsShelf();
  } else {
    unblurShortsMenu();
    if (isShortsPage()) unblurShortsPage();
    unblurShortsShelf();
  }
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_SHORTS_BLUR") {
    const blurShorts = message.payload;
    chrome.storage.local.set({ shortsBlurEnabled: blurShorts });
    applyShortsToggle(blurShorts);
  }
});

let lastUrl = location.href;
const observeUrlChanges = () => {
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;

      if (isShortsPage() && isBlurEnabled) {
        blurShortsPage();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
};
observeUrlChanges();
