let isHomePageBlurEnabled = true;

const blurRecommendedVideos = () => {
  // Target home page video grid
  const homeVideoGrid = document.querySelector('ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer') as HTMLElement | null;
  const homeVideoItems = document.querySelectorAll('ytd-rich-item-renderer') as NodeListOf<HTMLElement>;
  
  // Target video page recommendations (right sidebar)
  const videoPageRecommendations = document.querySelector('ytd-watch-next-secondary-results-renderer') as HTMLElement | null;
  const recommendedVideoItems = document.querySelectorAll('ytd-compact-video-renderer, ytd-compact-radio-renderer') as NodeListOf<HTMLElement>;
  
  // Target related videos below the current video
  const relatedVideos = document.querySelector('#related') as HTMLElement | null;
  const belowVideoItems = document.querySelectorAll('ytd-watch-next-secondary-results-renderer ytd-item-section-renderer') as NodeListOf<HTMLElement>;
  
  // Target videos after Shorts section
  const shortsSection = document.querySelector('ytd-reel-shelf-renderer') as HTMLElement | null;
  const afterShortsVideos = document.querySelectorAll('ytd-rich-section-renderer, ytd-shelf-renderer') as NodeListOf<HTMLElement>;
  const videoShelves = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer') as NodeListOf<HTMLElement>;
  
  // Target right side recommended videos in video page
  const rightSideVideos = document.querySelectorAll('ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer, ytd-watch-next-secondary-results-renderer ytd-compact-playlist-renderer') as NodeListOf<HTMLElement>;
  const rightSideContainer = document.querySelector('ytd-watch-next-secondary-results-renderer #items') as HTMLElement | null;
  
  // Blur home page videos if they exist
  if (homeVideoGrid) {
    homeVideoGrid.style.filter = "blur(25px)";
    homeVideoGrid.style.opacity = "0.8";
    
    homeVideoItems.forEach(item => {
      item.style.pointerEvents = "none";
      item.style.userSelect = "none";
    });
  }

  // Blur video page recommendations if they exist
  if (videoPageRecommendations) {
    videoPageRecommendations.style.filter = "blur(25px)";
    videoPageRecommendations.style.opacity = "0.8";
    
    recommendedVideoItems.forEach(item => {
      item.style.pointerEvents = "none";
      item.style.userSelect = "none";
    });
  }

  // Blur related videos below current video
  if (relatedVideos) {
    relatedVideos.style.filter = "blur(25px)";
    relatedVideos.style.opacity = "0.8";
    
    belowVideoItems.forEach(item => {
      item.style.pointerEvents = "none";
      item.style.userSelect = "none";
    });
  }

  // Blur videos that appear after Shorts
  if (shortsSection) {
    // Find and blur all video sections after Shorts
    afterShortsVideos.forEach(section => {
      if (section.compareDocumentPosition(shortsSection) === Node.DOCUMENT_POSITION_PRECEDING) {
        section.style.filter = "blur(25px)";
        section.style.opacity = "0.8";
        section.style.pointerEvents = "none";
        section.style.userSelect = "none";
      }
    });

    // Blur individual video items
    videoShelves.forEach(video => {
      if (video.compareDocumentPosition(shortsSection) === Node.DOCUMENT_POSITION_PRECEDING) {
        video.style.filter = "blur(25px)";
        video.style.opacity = "0.8";
        video.style.pointerEvents = "none";
        video.style.userSelect = "none";
      }
    });
  }

  // Blur right side recommended videos
  if (rightSideContainer) {
    rightSideContainer.style.filter = "blur(25px)";
    rightSideContainer.style.opacity = "0.8";
    
    rightSideVideos.forEach(video => {
      video.style.pointerEvents = "none";
      video.style.userSelect = "none";
      // Add additional styles to ensure thumbnails are blurred
      const thumbnail = video.querySelector('ytd-thumbnail') as HTMLElement;
      if (thumbnail) {
        thumbnail.style.filter = "blur(25px)";
        thumbnail.style.opacity = "0.8";
      }
    });
  }
};

const removeRecommendedBlur = () => {
  // Clear home page blur
  const homeVideoGrid = document.querySelector('ytd-rich-grid-renderer #contents.ytd-rich-grid-renderer') as HTMLElement | null;
  const homeVideoItems = document.querySelectorAll('ytd-rich-item-renderer') as NodeListOf<HTMLElement>;
  
  // Clear video page recommendations blur
  const videoPageRecommendations = document.querySelector('ytd-watch-next-secondary-results-renderer') as HTMLElement | null;
  const recommendedVideoItems = document.querySelectorAll('ytd-compact-video-renderer, ytd-compact-radio-renderer') as NodeListOf<HTMLElement>;
  
  // Clear related videos blur
  const relatedVideos = document.querySelector('#related') as HTMLElement | null;
  const belowVideoItems = document.querySelectorAll('ytd-watch-next-secondary-results-renderer ytd-item-section-renderer') as NodeListOf<HTMLElement>;
  
  // Clear blur from videos after Shorts
  const afterShortsVideos = document.querySelectorAll('ytd-rich-section-renderer, ytd-shelf-renderer') as NodeListOf<HTMLElement>;
  const videoShelves = document.querySelectorAll('ytd-video-renderer, ytd-rich-item-renderer') as NodeListOf<HTMLElement>;
  
  // Clear right side recommended videos blur
  const rightSideVideos = document.querySelectorAll('ytd-watch-next-secondary-results-renderer ytd-compact-video-renderer, ytd-watch-next-secondary-results-renderer ytd-compact-playlist-renderer') as NodeListOf<HTMLElement>;
  const rightSideContainer = document.querySelector('ytd-watch-next-secondary-results-renderer #items') as HTMLElement | null;
  
  if (homeVideoGrid) {
    homeVideoGrid.style.filter = "";
    homeVideoGrid.style.opacity = "";
    
    homeVideoItems.forEach(item => {
      item.style.pointerEvents = "";
      item.style.userSelect = "";
    });
  }

  if (videoPageRecommendations) {
    videoPageRecommendations.style.filter = "";
    videoPageRecommendations.style.opacity = "";
    
    recommendedVideoItems.forEach(item => {
      item.style.pointerEvents = "";
      item.style.userSelect = "";
    });
  }

  if (relatedVideos) {
    relatedVideos.style.filter = "";
    relatedVideos.style.opacity = "";
    
    belowVideoItems.forEach(item => {
      item.style.pointerEvents = "";
      item.style.userSelect = "";
    });
  }

  afterShortsVideos.forEach(section => {
    section.style.filter = "";
    section.style.opacity = "";
    section.style.pointerEvents = "";
    section.style.userSelect = "";
  });

  videoShelves.forEach(video => {
    video.style.filter = "";
    video.style.opacity = "";
    video.style.pointerEvents = "";
    video.style.userSelect = "";
  });

  if (rightSideContainer) {
    rightSideContainer.style.filter = "";
    rightSideContainer.style.opacity = "";
    
    rightSideVideos.forEach(video => {
      video.style.pointerEvents = "";
      video.style.userSelect = "";
      // Clear thumbnail blur
      const thumbnail = video.querySelector('ytd-thumbnail') as HTMLElement;
      if (thumbnail) {
        thumbnail.style.filter = "";
        thumbnail.style.opacity = "";
      }
    });
  }
};

// Update the observer to be more specific
const recommendationsObserver = new MutationObserver((mutations) => {
  if (isHomePageBlurEnabled) {
    // Check if the mutation includes video content
    const hasVideoContent = mutations.some(mutation => {
      const target = mutation.target as Element;
      return target && target.querySelector?.(
        'ytd-rich-section-renderer, ytd-shelf-renderer, ytd-video-renderer, ytd-rich-item-renderer'
      );
    });

    if (hasVideoContent) {
      blurRecommendedVideos();
    }
  }
});

// Message handler setup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message;

  if (type === "TOGGLE_HOME_PAGE_BLUR") {
    isHomePageBlurEnabled = payload;
    chrome.storage.local.set({ homePageBlurEnabled: isHomePageBlurEnabled });

    if (isHomePageBlurEnabled) {
      blurRecommendedVideos();
      recommendationsObserver.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true 
      });
    } else {
      removeRecommendedBlur();
      recommendationsObserver.disconnect();
    }
  }
});

// Initialize on page load
chrome.storage.local.get({ homePageBlurEnabled: true }, ({ homePageBlurEnabled }) => {
  isHomePageBlurEnabled = homePageBlurEnabled;
  
  if (homePageBlurEnabled) {
    blurRecommendedVideos();
    recommendationsObserver.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: true 
    });
  }
});

export { blurRecommendedVideos as blurHomePage, removeRecommendedBlur as removeHomePageBlur, recommendationsObserver as homePageObserver }; 