(() => {
  console.log("LinkedIn blur script injected at", location.href);

  const BlurSection = "filter:blur(8px)!important; pointer-events:none!important; user-select:none!important;";

  // Blur "people you may know" toggle function
  const togglePYMK = (on: boolean) => {
    document.querySelectorAll<HTMLElement>("section").forEach(sec => {
      if (
        /people you may know/i.test(sec.innerText) ||
        /People to follow based on your activity/i.test(sec.innerText) ||
        /People who are in/i.test(sec.innerText) ||
        /People in the/i.test(sec.innerText) ||
        /More suggestions for you/i.test(sec.innerText)
      ) {
        sec.style.cssText = on ? BlurSection : "";
      }
    });
  };

  // Blur LinkedIn News toggle function
  const toggleNews = (on: boolean) => {
    // “LinkedIn News” widget typically appears as a <section> containing that heading
    document.querySelectorAll<HTMLElement>("section").forEach(sec => {
      // Look for “LinkedIn News” or “Top stories” in the section’s innerText
      if (
        /LinkedIn News/i.test(sec.innerText) ||
        /Top stories/i.test(sec.innerText)
      ) {
        sec.style.cssText = on ? BlurSection : "";
      }
       // ALSO BLUR the Notifications feed when on /notifications URL
      if (
        location.pathname.startsWith("/notifications")
      ) {
      // LinkedIn wraps notification items in a "scaffold-finite-scroll__content" container
      document
     .querySelectorAll<HTMLElement>("div.scaffold-finite-scroll__content")
     .forEach(el => {
        el.style.cssText = on ? BlurSection : "";
      });
    }
    });
  };

  // Blur job suggestions toggle function
  const toggleJobPageSections = (on: boolean) => {
    // Blur any sections by their visible heading text
    document.querySelectorAll<HTMLElement>("section").forEach(sec => {
      if (
        /Top job picks for you/i.test(sec.innerText) ||
        /Suggested job searches/i.test(sec.innerText) ||
        /Hiring in your network/i.test(sec.innerText) ||
        /More jobs for you/i.test(sec.innerText) ||
        /Recommended for you/i.test(sec.innerText)
      ) {
        sec.style.cssText = on ? BlurSection : "";
      }
    });

    // Blur structural modules by class or ID
    [
      "div.discovery-templates-jobs-feed-discovery-module",
      "div.discovery-templates-jobs-feed-discovery-module__next-page",
      "section.discovery-templates-vertical-list__next-page",
      "ul#jobs-home-vertical-list__entity-list",
    ].forEach(selector => {
      document.querySelectorAll<HTMLElement>(selector).forEach(el => { 
        el.style.cssText = on ? BlurSection : ""; 
      });
    });
  };

  // Stored setting on load
  chrome.storage.local.get(
    { linkedinBlurPYMK: true, linkedinBlurNews: true, linkedinBlurJobs: true },
    ({ linkedinBlurPYMK, linkedinBlurNews, linkedinBlurJobs }) => {
      togglePYMK(linkedinBlurPYMK);
      toggleNews(linkedinBlurNews);
      toggleJobPageSections(linkedinBlurJobs);
    }
  );

  // Re-apply if LinkedIn lazy-injects more sections
  new MutationObserver(muts => {
    if (muts.some(m => m.addedNodes.length)) {
      chrome.storage.local.get(
        { linkedinBlurPYMK: true, linkedinBlurNews: true, linkedinBlurJobs: true },
        ({ linkedinBlurPYMK, linkedinBlurNews, linkedinBlurJobs }) => {
          togglePYMK(linkedinBlurPYMK);
          toggleNews(linkedinBlurNews);
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
    if (msg.type === "TOGGLE_LINKEDIN_NEWS") {
      toggleNews(!!msg.payload);
      sendResponse({ ok: true });
    }
    if (msg.type === "TOGGLE_LINKEDIN_JOBS_BLUR") {
      toggleJobPageSections(!!msg.payload);
      sendResponse({ ok: true });
    }
  });
})();
