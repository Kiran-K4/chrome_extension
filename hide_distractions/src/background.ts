chrome.action.onClicked.addListener((tab) => {
    const width = 300;
    const height = 400;
  
    chrome.windows.getCurrent((win) => {
      const left = Math.round(win.left + (win.width - width) / 2);
      const top = Math.round(win.top + (win.height - height) / 2);
  
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