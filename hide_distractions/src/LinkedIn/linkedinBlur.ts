console.log("🔵 LinkedIn blur script running...");

function blurElementByLabel(label: string) {
  const section = document.querySelector(`[aria-label="${label}"]`) as HTMLElement | null;
  if (section) {
    section.style.filter = "blur(6px)";
    section.style.pointerEvents = "none";
    console.log(`✅ '${label}' blurred`);
  }
}

function blurFeedAndNews() {
  blurElementByLabel("Main feed");         // main feed of posts
  blurElementByLabel("LinkedIn News");     // sidebar news section
}

const observer = new MutationObserver(() => {
  blurFeedAndNews(); // retry on DOM changes
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

blurFeedAndNews(); // initial attempt

// Optional: stop observing after 10s
setTimeout(() => {
  observer.disconnect();
  console.log("🛑 Stopped observing DOM changes");
}, 10000);
