console.log("Content script injected")

// Hiding test 
const selectorsToHide = ['#comments', '.sidebar', 'ytd-watch-next-secondary-results-renderer']

for (const selector of selectorsToHide) {
  const el = document.querySelector(selector)
  if (el) el.remove()
}

function blockVideoClicks() {
  // Find all video elements and links
  const videoElements = document.querySelectorAll(`
    ytd-rich-item-renderer,
    ytd-video-renderer,
    ytd-grid-video-renderer,
    ytd-compact-video-renderer,
    ytd-rich-grid-media,
    a.ytd-thumbnail,
    ytd-thumbnail-overlay-toggle-button-renderer,
    ytd-thumbnail-overlay-now-playing-renderer,
    ytd-thumbnail-overlay-resume-playback-renderer,
    ytd-thumbnail-overlay-time-status-renderer
  `);

  // Prevent clicks on all video elements
  videoElements.forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }, true);

    // Also prevent any href navigation
    const links = element.getElementsByTagName('a');
    Array.from(links).forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);
      
      // Disable the href
      link.style.pointerEvents = 'none';
      link.href = 'javascript:void(0)';
    });
  });
}

function addStrictClickBlocker() {
  // Create an absolutely positioned overlay for the content area
  const contentOverlay = document.createElement('div');
  contentOverlay.id = 'focus-bear-content-blocker';
  
  const overlayStyle = document.createElement('style');
  overlayStyle.textContent = `
    #focus-bear-content-blocker {
      position: fixed;
      top: 60px; /* Height of YouTube header */
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99999;
      background: transparent;
      cursor: not-allowed !important;
    }

    /* Prevent any interaction with video elements */
    ytd-rich-item-renderer,
    ytd-video-renderer,
    ytd-grid-video-renderer,
    ytd-compact-video-renderer,
    ytd-rich-grid-media,
    ytd-thumbnail,
    a.ytd-thumbnail,
    ytd-thumbnail-overlay-toggle-button-renderer {
      pointer-events: none !important;
      cursor: not-allowed !important;
      user-select: none !important;
      -webkit-user-select: none !important;
    }

    /* Ensure header stays clickable */
    ytd-masthead {
      z-index: 100000;
      position: relative;
    }
  `;

  document.head.appendChild(overlayStyle);
  document.body.appendChild(contentOverlay);

  // Block all events
  contentOverlay.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);

  contentOverlay.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);

  contentOverlay.addEventListener('mouseup', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }, true);

  // Block right-click
  contentOverlay.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, true);
}

function addClickBlocker() {
  // Create a full-page overlay to catch all clicks
  const overlay = document.createElement('div');
  overlay.id = 'focus-bear-overlay';
  
  const style = document.createElement('style');
  style.textContent = `
    #focus-bear-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: transparent;
      pointer-events: all;
    }
    
    /* Allow clicks only on header elements */
    ytd-masthead,
    #masthead-container,
    #guide-button,
    ytd-searchbox,
    .ytd-searchbox,
    #search-container,
    #guide-content {
      position: relative;
      z-index: 10000;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  
  // Prevent all clicks on the overlay with proper type checking
  overlay.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Allow clicks only if target is in header
    const isHeader = target.closest('ytd-masthead, #masthead-container, #guide-button, ytd-searchbox, #search-container, #guide-content');
    
    if (!isHeader) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, true);
}

function addAbsoluteBlocker() {
  // Create a completely blocking overlay
  const blocker = document.createElement('div');
  blocker.id = 'focus-bear-absolute-blocker';
  
  const style = document.createElement('style');
  style.textContent = `
    #focus-bear-absolute-blocker {
      position: fixed;
      top: 56px; /* YouTube header height */
      left: 72px; /* YouTube sidebar width */
      right: 0;
      bottom: 0;
      z-index: 999999;
      background: transparent;
      cursor: not-allowed !important;
    }

    /* Disable all pointer events on video elements */
    ytd-rich-grid-renderer *,
    ytd-rich-item-renderer *,
    ytd-video-renderer *,
    ytd-grid-video-renderer *,
    ytd-compact-video-renderer *,
    ytd-rich-grid-media *,
    ytd-thumbnail *,
    a.ytd-thumbnail * {
      pointer-events: none !important;
    }

    /* Make sure header and sidebar stay interactive */
    ytd-masthead,
    ytd-mini-guide-renderer,
    ytd-guide-renderer {
      position: relative !important;
      z-index: 1000000 !important;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(blocker);

  // Capture and prevent all possible mouse events
  const events = ['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'auxclick'];
  events.forEach(eventType => {
    blocker.addEventListener(eventType, (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }, { capture: true, passive: false });

    // Also prevent events on document level
    document.addEventListener(eventType, (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Allow clicks only on header and sidebar
      const isAllowed = target.closest('ytd-masthead, ytd-mini-guide-renderer, ytd-guide-renderer');
      if (!isAllowed) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, { capture: true, passive: false });
  });

  // Disable all anchor tags in the main content
  function disableLinks() {
    const links = document.querySelectorAll('a[href*="watch"], a[href*="shorts"], a[href*="playlist"]');
    links.forEach(link => {
      const anchor = link as HTMLAnchorElement;
      anchor.style.pointerEvents = 'none';
      anchor.href = 'javascript:void(0)';
      anchor.onclick = (e) => {
        e.preventDefault();
        return false;
      };
      anchor.setAttribute('data-blocked', 'true');
    });
  }

  // Run link disabling periodically to catch dynamic content
  disableLinks();
  setInterval(disableLinks, 1000);
}

function addTotalBlocker() {
  const totalBlockStyle = document.createElement('style');
  totalBlockStyle.id = 'focus-bear-total-block';
  totalBlockStyle.textContent = `
    /* Completely disable all interactions */
    ytd-rich-grid-renderer,
    ytd-rich-item-renderer,
    ytd-video-renderer,
    ytd-grid-video-renderer,
    ytd-compact-video-renderer,
    ytd-rich-grid-media,
    ytd-thumbnail,
    a.ytd-thumbnail,
    ytd-thumbnail-overlay-toggle-button-renderer,
    #dismissible.ytd-rich-grid-media,
    #contents.ytd-rich-grid-renderer,
    ytd-rich-section-renderer,
    ytd-shelf-renderer,
    ytd-video-meta-block,
    ytd-thumbnail-overlay-time-status-renderer,
    ytd-thumbnail-overlay-now-playing-renderer,
    ytd-thumbnail-overlay-resume-playback-renderer,
    ytd-thumbnail-overlay-toggle-button-renderer,
    ytd-playlist-thumbnail {
      pointer-events: none !important;
      cursor: not-allowed !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      touch-action: none !important;
      filter: blur(10px);
    }

    /* Remove hover effects */
    ytd-rich-item-renderer:hover,
    ytd-video-renderer:hover,
    ytd-grid-video-renderer:hover,
    ytd-compact-video-renderer:hover,
    ytd-rich-grid-media:hover {
      pointer-events: none !important;
      cursor: not-allowed !important;
      filter: blur(10px) !important;
    }

    /* Create invisible blocking layer */
    #primary {
      position: relative;
    }

    #primary::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100000;
      background: transparent;
      pointer-events: auto;
      cursor: not-allowed;
    }
  `;
  
  document.head.appendChild(totalBlockStyle);

  // Block all click events at the document level
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // Allow clicks only on header and sidebar
    const isAllowed = target.closest('ytd-masthead, ytd-mini-guide-renderer, ytd-guide-renderer, #masthead-container');
    if (!isAllowed) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }
  }, { capture: true, passive: false });
}

function blurYouTubeFeed() {
  const existingStyle = document.querySelector('#focus-bear-style');
  if (existingStyle) existingStyle.remove();

  const style = document.createElement('style');
  style.id = 'focus-bear-style';
  style.textContent = `
    /* Target main feed container */
    ytd-rich-grid-renderer,
    ytd-rich-item-renderer,
    ytd-video-renderer,
    ytd-grid-video-renderer,
    ytd-rich-grid-media,
    #contents.ytd-rich-grid-renderer,
    #primary.ytd-two-column-browse-results-renderer,
    ytd-browse[page-subtype="home"],
    ytd-two-column-browse-results-renderer,
    ytd-thumbnail,
    ytd-compact-video-renderer,
    ytd-rich-section-renderer,
    ytd-shelf-renderer,
    #dismissible.ytd-rich-grid-media,
    #content.ytd-rich-grid-media,
    a.ytd-thumbnail,
    ytd-thumbnail-overlay-toggle-button-renderer,
    ytd-thumbnail-overlay-now-playing-renderer,
    ytd-thumbnail-overlay-resume-playback-renderer,
    ytd-thumbnail-overlay-time-status-renderer {
      filter: blur(10px) !important;
      pointer-events: none !important;
      user-select: none !important;
      cursor: not-allowed !important;
      pointer-events: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    }

    /* Make videos completely unclickable */
    a[href*="watch"],
    a[href*="shorts"],
    a[href*="playlist"],
    ytd-thumbnail.ytd-rich-grid-media,
    ytd-thumbnail.ytd-rich-item-renderer {
      pointer-events: none !important;
      cursor: not-allowed !important;
      text-decoration: none !important;
    }

    /* Create overlay to block interactions */
    ytd-rich-item-renderer::before,
    ytd-video-renderer::before,
    ytd-grid-video-renderer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      background: transparent;
      pointer-events: auto !important;  /* Catch all click events */
    }

    /* Keep header and search clear */
    ytd-masthead,
    #masthead-container,
    ytd-searchbox,
    .ytd-searchbox,
    #search-container,
    #search-form,
    #guide-content,
    ytd-mini-guide-renderer,
    ytd-guide-renderer,
    #guide-button {
      filter: none !important;
      pointer-events: auto !important;
      user-select: auto !important;
      cursor: auto !important;
    }

    /* Optional: Show message on hover */
    ytd-rich-item-renderer:hover::after,
    ytd-video-renderer:hover::after {
      content: 'Blocked by Focus Bear';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      z-index: 11;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
  
  // Apply click blocking
  blockVideoClicks();
  
  // Reapply click blocking when content changes
  const observer = new MutationObserver(() => {
    blockVideoClicks();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  addClickBlocker();
  
  // Make all video links unclickable
  document.querySelectorAll('a').forEach(link => {
    if (link.href.includes('watch') || link.href.includes('shorts') || link.href.includes('playlist')) {
      link.style.pointerEvents = 'none';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, true);
      link.href = 'javascript:void(0)';
    }
  });

  addStrictClickBlocker();
  addAbsoluteBlocker();
  addTotalBlocker();
}

function removeBlur() {
  const style = document.querySelector('#focus-bear-style');
  if (style) style.remove();
  
  // Remove the overlay
  const overlay = document.querySelector('#focus-bear-overlay');
  if (overlay) overlay.remove();
  
  // Remove strict blocker
  const contentBlocker = document.querySelector('#focus-bear-content-blocker');
  if (contentBlocker) contentBlocker.remove();
  
  // Remove absolute blocker
  const absoluteBlocker = document.querySelector('#focus-bear-absolute-blocker');
  if (absoluteBlocker) absoluteBlocker.remove();

  // Remove total blocker
  const totalBlockStyle = document.querySelector('#focus-bear-total-block');
  if (totalBlockStyle) totalBlockStyle.remove();
}

// Update the check and apply function
function checkAndApplyHomepageBlur(isEnabled: boolean) {
  console.log('Checking and applying blur:', isEnabled); // Debug log
  
  if (!isEnabled) {
    removeBlur();
    return;
  }

  // Apply immediately and retry to ensure it catches
  blurYouTubeFeed();
  blockVideoClicks(); // Add immediate click blocking
  
  // Also retry a few times to catch dynamic content
  const retryTimes = [100, 500, 1000, 2000];
  retryTimes.forEach(time => {
    setTimeout(() => {
      blurYouTubeFeed();
      blockVideoClicks();
    }, time);
  });
}

// Enhanced message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleBlocking') {
    console.log('Toggle blocking received:', request.isEnabled);
    checkAndApplyHomepageBlur(request.isEnabled);
    sendResponse({ success: true });
  }
  return true; // Keep the message channel open for async response
});

// Enhanced URL change detection
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    chrome.storage.sync.get(['isBlockingEnabled'], (result) => {
      if (result.isBlockingEnabled) {
        checkAndApplyHomepageBlur(true);
      }
    });
  }
}).observe(document, { subtree: true, childList: true });

// Initial state check with retry mechanism
function initializeBlurState() {
  chrome.storage.sync.get(['isBlockingEnabled'], (result) => {
    if (result.isBlockingEnabled) {
      checkAndApplyHomepageBlur(true);
    }
  });
}

// Run on load and after a short delay to ensure content is loaded
document.addEventListener('DOMContentLoaded', initializeBlurState);
window.addEventListener('load', initializeBlurState);
setTimeout(initializeBlurState, 1000); // Backup check

// Add immediate initialization
initializeBlurState();

// Add mutation observer for dynamic content
const contentObserver = new MutationObserver(() => {
  chrome.storage.sync.get(['isBlockingEnabled'], (result) => {
    if (result.isBlockingEnabled) {
      checkAndApplyHomepageBlur(true);
    }
  });
});

contentObserver.observe(document.body, {
  childList: true,
  subtree: true
});