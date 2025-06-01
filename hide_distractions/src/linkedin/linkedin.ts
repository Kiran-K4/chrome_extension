console.log("[LinkedIn] Content script injected");

const JOBS_ICON_SELECTOR = '[data-test-global-nav-link="jobs"]';
let isLinkedInBlurEnabled = true; // 🛠 Renamed to avoid conflict

const blurJobsIcon = () => {
  const jobsIcon = document.querySelector(JOBS_ICON_SELECTOR) as HTMLElement | null;
  if (jobsIcon) {
    jobsIcon.style.filter = "blur(6px)";
    jobsIcon.style.pointerEvents = "none";
    jobsIcon.style.userSelect = "none";
    jobsIcon.style.opacity = "0.5";
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

const jobsObserver = new MutationObserver(() => {
  if (isLinkedInBlurEnabled) {
    blurJobsIcon();
  } else {
    unblurJobsIcon();
  }
});

jobsObserver.observe(document.body, { childList: true, subtree: true });
applyInitialJobsBlur();

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
