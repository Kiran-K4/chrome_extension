console.log("Content script injected");

//To remove the unwanted elements from the page
const selectorsToHide = ['#comments', '.sidebar', 'ytd-watch-next-secondary-results-renderer'];
for (const selector of selectorsToHide) {
  const el = document.querySelector(selector);
  if (el) el.remove();
}

//To blur certain sections in the sidebar
//To create a MutationObserver for observing any changes in the DOM
const sidebarObserver = new MutationObserver(() => {
  const sectionsToBlur = document.querySelectorAll('ytd-guide-section-renderer');

  sectionsToBlur.forEach((section, index) => {
    //To blur and disable interactions only for specfic sections that is index 1 and index 2
    if (index === 1 || index === 2 || index === 3) {
      const el = section as HTMLElement;
      //To apply the blur effect 
      el.style.filter = 'blur(6px)';
      //To disable the mouse hovering or other mouse interactions
      el.style.pointerEvents = 'none'; 
      //To disable the text selection
      el.style.userSelect = 'none'
    }
  });
});

// To start observing the entire sidebar for new elements (dynamic loading)
sidebarObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

//To blur the topic chips bar (where the different categories are present)
const blurTopicChips = () => {
  const chipsBar = document.querySelector('ytd-feed-filter-chip-bar-renderer') as HTMLElement | null;

  if (chipsBar instanceof HTMLElement) {
    //To apply the blur effect
    chipsBar.style.filter = 'blur(6px)';
    //To disbale the pointer clicking
    chipsBar.style.pointerEvents = 'none';
    //To prevent the text selection
    chipsBar.style.userSelect = 'none'; 
  }
};

//To blur the chips immediately on page load
blurTopicChips();

//To set up another MutationObserver to monitor any future changes (as Youtube reloads section dynamically)
const chipsObserver = new MutationObserver(() => {
  //To reapply the blur if the chips are re-rendered
  blurTopicChips();
});

// To start observing the entire chipsbar for new elements (dynamic loading)
chipsObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
