console.log('Content script injected');

const STYLE_ID = 'focus-bear-hide-comments-style';
const selectorsToHide = [
  '#comments',
  // '.sidebar',
  // 'ytd-watch-next-secondary-results-renderer'
];

// inject a <style> to hide everything matching our selectors
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
chrome.storage.local.get({ commentsHidden: false }, ({ commentsHidden }) => {
  if (commentsHidden) applyHide();
});

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
    // return true so we can sendResponse asynchronously
    return true;
  }
});