console.log("[LinkedIn] Content script injected");

const JOBS_ICON_SELECTOR = '[data-test-global-nav-link="jobs"]';
let isLinkedInBlurEnabled = true;

// ─── Blur Logic ─────────────────────────────────────
const blurJobsIcon = () => {
  const jobsIcon = document.querySelector(JOBS_ICON_SELECTOR) as HTMLElement | null;
  if (jobsIcon) {
    jobsIcon.style.filter = "blur(6px)";
    jobsIcon.style.pointerEvents = "none";
    jobsIcon.style.userSelect = "none";
    jobsIcon.style.opacity = "0.5";
    jobsIcon.style.background = "transparent";
    console.log("[LinkedIn] Jobs icon blurred");
  }
};

const unblurJobsIcon = () => {
  const jobsIcon = document.querySelector(JOBS_ICON_SELECTOR) as HTMLElement | null;
  if (jobsIcon) {
    jobsIcon.style.filter = "";
    jobsIcon.style.pointerEvents = "";
    jobsIcon.style.userSelect = "";
    jobsIcon.style.opacity = "1";
    jobsIcon.style.background = "";
    console.log("[LinkedIn] Jobs icon unblurred");
  }
};

const applyInitialJobsBlur = () => {
  chrome.storage.local.get({ blurLinkedInJobs: true }, ({ blurLinkedInJobs }) => {
    isLinkedInBlurEnabled = blurLinkedInJobs;
    if (blurLinkedInJobs) blurJobsIcon();
    else unblurJobsIcon();
  });
};

// ─── React to DOM Changes ───────────────────────────
const jobsObserver = new MutationObserver(() => {
  if (isLinkedInBlurEnabled) blurJobsIcon();
  else unblurJobsIcon();
});
jobsObserver.observe(document.body, { childList: true, subtree: true });

// ─── Toggle Handler (from popup toggle) ─────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TOGGLE_LINKEDIN_JOBS_BLUR") {
    isLinkedInBlurEnabled = message.payload;
    chrome.storage.local.set({ blurLinkedInJobs: isLinkedInBlurEnabled });
    if (isLinkedInBlurEnabled) {
      blurJobsIcon();
    } else {
      unblurJobsIcon();
    }
  }
});

applyInitialJobsBlur();

// ─── Intention Popup Injection Logic ────────────────
const linkedInDomain = window.location.hostname.replace(/^www\./, "");
console.log("[LinkedIn] Checking for focus session...");

chrome.storage.local.get(["focusData"], ({ focusData }) => {
  const session = focusData?.[linkedInDomain];
  if (!session) {
    console.log(`[LinkedIn] No session found for ${linkedInDomain}, injecting popup`);

    if (!document.getElementById("intention-popup-script")) {
      const script = document.createElement("script");
      script.src = chrome.runtime.getURL("floatingPopup.js");
      script.id = "intention-popup-script";
      script.type = "module";
      script.onload = () => {
        window.postMessage({
          type: "INIT_INTENTION_DATA",
          payload: {
            lastIntention: "",
            lastFocusDuration: 0,
          },
        }, "*");
      };
      document.body.appendChild(script);
    }
  } else {
    console.log(`[LinkedIn] Focus session already exists for ${linkedInDomain}, skipping popup.`);
  }
});

// ─── Reinject Popup When Timer Expires ──────────────
window.addEventListener("show-popup-again", () => {
  console.log("[LinkedIn] show-popup-again fired, injecting popup again");

  chrome.storage.local.get(["lastIntention", "lastFocusDuration"], ({ lastIntention, lastFocusDuration }) => {
    if (document.getElementById("intention-popup-script")) return;

    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("floatingPopup.js");
    script.id = "intention-popup-script";
    script.type = "module";

    script.onload = () => {
      window.postMessage(
        {
          type: "INIT_INTENTION_DATA",
          payload: { lastIntention, lastFocusDuration },
        },
        "*"
      );
    };

    document.body.appendChild(script);
  });
});
