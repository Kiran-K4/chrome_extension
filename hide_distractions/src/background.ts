chrome.action.onClicked.addListener((tab) => {
    const width = 300;
    const height = 400;
  
    chrome.windows.getCurrent((win) => {
      // Default values if window properties are undefined
      const windowLeft = win.left ?? 0;
      const windowTop = win.top ?? 0;
      const windowWidth = win.width ?? width;
      const windowHeight = win.height ?? height;

      const left = Math.round(windowLeft + (windowWidth - width) / 2);
      const top = Math.round(windowTop + (windowHeight - height) / 2);
  
      chrome.windows.create({
        url: "popup.html",
        type: "popup",
        width,
        height,
        left,
        top
      });
    });
  });