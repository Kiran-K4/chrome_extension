console.log("Content script injected");

if (!document.getElementById("intention-popup-script")) {
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("floatingPopup.js");
  script.id = "intention-popup-script";
  script.type = "module";
  document.body.appendChild(script);
}

let isBlurEnabled = true;

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

    // To avoid the layout shift
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
    console.log("[FocusBear] TOGGLE_BLUR received:", isBlurEnabled);

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
