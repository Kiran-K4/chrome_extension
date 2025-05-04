import React, { useEffect, useState } from 'react';

const Sidebarblur = () => {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get('blurEnabled', ({ blurEnabled }) => {
      setEnabled(blurEnabled !== false); 
    });
  }, []);

  const toggle = async () => {
    const newValue = !enabled;
    setEnabled(newValue);
    chrome.storage.local.set({ blurEnabled: newValue });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_BLUR',
        payload: newValue,
      });
    }
  };

  return (
    <div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="checkbox" checked={enabled} onChange={toggle} />
        {enabled ? 'Blur distractions' : 'Unblurred'}
      </label>
    </div>
  );
};

export default Sidebarblur;
