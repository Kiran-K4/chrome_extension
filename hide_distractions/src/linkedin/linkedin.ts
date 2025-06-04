console.log("LinkedIn blur script injected at", location.href);

const togglePYMK = (on: boolean) => {
  document.querySelectorAll<HTMLElement>("section").forEach(sec => {
    if (
      /people you may know/i.test(sec.innerText) ||
      /People to follow based on your activity/i.test(sec.innerText) ||
      /People who are in/i.test(sec.innerText) ||
      /People in the/i.test(sec.innerText) ||
      /More suggestions for you/i.test(sec.innerText)
    ) {
      sec.style.cssText = on
        ? "filter: blur(8px)!important; pointer-events: none!important; user-select: none!important;"
        : "";
    }
  });
};

const toggleJobPageSections = (on: boolean) => {
  if (!location.pathname.startsWith("/jobs")) return;

  const selectors = [
    //Top job picks and general job sections
    '[class*="job-recommendations"]',
    'section:has(h2, h3):has(button, a)',

    //Show all buttons
    'button span:contains("Show all")',
    'a span:contains("Show all")',

    //Promoted listings
    'li:has(span:contains("Promoted"))',
    'div:has(span:contains("Promoted"))',

    //Search for more jobs section
    'div:has-text("Search for more jobs")',
    'button:has(span:contains("Search for more jobs"))',
    'a:has(span:contains("Search for more jobs"))',

  ];

  selectors.forEach(selector => {
    document.querySelectorAll<HTMLElement>(selector).forEach(el => {
      el.style.cssText = on
        ? "filter: blur(8px)!important; pointer-events: none!important; user-select: none!important;"
        : "";
    });
  });
};

const blurAllExceptEssentials = (on: boolean) => {
  if (!location.pathname.startsWith("/jobs")) return;

  const essentials = [
    'header', 
    'aside.jobs-home-soho-card' 
  ];

  document.querySelectorAll<HTMLElement>("body > *").forEach(el => {
    const isEssential = essentials.some(sel => el.matches(sel) || el.querySelector(sel));
    if (!isEssential) {
      el.style.cssText = on
        ? "filter: blur(8px)!important; pointer-events: none!important; user-select: none!important;"
        : "";
    }
  });
};

// Blur/Un-blur “LinkedIn News” sections (Trending News)
const toggleNews = (on: boolean) => {
  // “LinkedIn News” widget typically appears as a <section> containing that heading
  document.querySelectorAll<HTMLElement>("section").forEach(sec => {
    // Look for “LinkedIn News” or “Top stories” in the section’s innerText
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


// Stored setting on load
chrome.storage.local.get(
  { linkedinBlurPYMK: true, linkedinBlurNews: true },
  ({ linkedinBlurPYMK, linkedinBlurNews }) => {
    togglePYMK(linkedinBlurPYMK);
    toggleNews(linkedinBlurNews);
  }
);

// Re-apply if LinkedIn lazy-injects more sections
new MutationObserver((mutations) => {
  if (mutations.some((m) => m.addedNodes.length)) {
    chrome.storage.local.get(
      { linkedinBlurPYMK: true, linkedinBlurNews: true },
      ({ linkedinBlurPYMK, linkedinBlurNews }) => {
        togglePYMK(linkedinBlurPYMK);
        toggleNews(linkedinBlurNews);
chrome.storage.local.get(
  {
    linkedinBlurPYMK: true,
    linkedinBlurJobs: true,
  },
  ({ linkedinBlurPYMK, linkedinBlurJobs }) => {
    togglePYMK(linkedinBlurPYMK);
    toggleJobPageSections(linkedinBlurJobs);
  }
);

new MutationObserver(muts => {
  if (muts.some(m => m.addedNodes.length)) {
    chrome.storage.local.get(
      {
        linkedinBlurPYMK: true,
        linkedinBlurJobs: true,
      },
      ({ linkedinBlurPYMK, linkedinBlurJobs }) => {
        togglePYMK(linkedinBlurPYMK);
        toggleJobPageSections(linkedinBlurJobs);
      }
    );
  }
}).observe(document.body, { childList: true, subtree: true });


// Listen for popup’s toggle
chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
  if (msg.type === "TOGGLE_LINKEDIN_BLUR") {
    togglePYMK(!!msg.payload);
    sendResponse({ ok: true });
  }
  else if (msg.type === "TOGGLE_LINKEDIN_NEWS") {
    toggleNews(!!msg.payload);
  if (msg.type === "TOGGLE_LINKEDIN_JOB_BLUR") {
    toggleJobPageSections(!!msg.payload);
    sendResponse({ ok: true });
  }
});
