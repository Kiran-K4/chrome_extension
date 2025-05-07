import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { IntentionProvider } from './context/intentionPopupContext';

// Remove the root background color settings
document.body.style.margin = '0';

// Add custom Toggle component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: checked ? '#4CAF50' : '#ccc',
      borderRadius: '20px',
      padding: '2px 8px',
      width: '55px',
      height: '24px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background-color 0.3s'
    }} onClick={onChange}>
      <span style={{
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        marginRight: 'auto'
      }}>
        {checked ? 'ON' : 'OFF'}
      </span>
      <div style={{
        width: '20px',
        height: '20px',
        backgroundColor: 'white',
        borderRadius: '50%',
        position: 'absolute',
        right: checked ? '2px' : 'auto',
        left: checked ? 'auto' : '2px',
        transition: '0.3s'
      }} />
    </div>
  );
};

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [homeBlurEnabled, setHomeBlurEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get('blurEnabled', ({ blurEnabled }) => {
      setBlurEnabled(blurEnabled !== false);
    });
    chrome.storage.local.get('commentsHidden', ({ commentsHidden }) => {
      setHidden(commentsHidden === true);
    });
  }, []);

  const handleBlurToggle = async () => {
    const newValue = !blurEnabled;
    setBlurEnabled(newValue);
    chrome.storage.local.set({ blurEnabled: newValue });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'TOGGLE_BLUR',
        payload: newValue,
      });
    }
  };

  const handleCommentsToggle = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'toggleComments' },
      (res) => {
        if (!chrome.runtime.lastError && res?.status) {
          setHidden(res.status === 'hidden');
        }
      }
    );
  };

  const handleHomeBlurToggle = async () => {
    const newValue = !homeBlurEnabled;
    setHomeBlurEnabled(newValue);
    // You'll need to implement the storage and messaging logic for this feature
  };

  return (
    <div style={{
      padding: 16,
      fontFamily: 'sans-serif',
      backgroundColor: '#FFC88B',
      borderRadius: 16,
      minWidth: 300,
      minHeight: 200,
      margin: 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 16,
        justifyContent: 'center'
      }}>
        <img 
          src="/icons/icon128.png" 
          alt="Bear Icon" 
          style={{ 
            width: 32, 
            height: 32,
            objectFit: 'contain',
            display: 'block'
          }} 
        />
        <h1 style={{ fontSize: 20, margin: 0 }}>YouTube</h1>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 12,
        marginTop: 24
      }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          flexDirection: 'row-reverse',
          justifyContent: 'flex-end'
        }}>
          <span style={{ fontSize: '16px' }}>Blur Home Page</span>
          <Toggle checked={homeBlurEnabled} onChange={handleHomeBlurToggle} />
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          flexDirection: 'row-reverse',
          justifyContent: 'flex-end'
        }}>
          <span style={{ fontSize: '16px' }}>Blur Distractions</span>
          <Toggle checked={blurEnabled} onChange={handleBlurToggle} />
        </label>

        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          flexDirection: 'row-reverse',
          justifyContent: 'flex-end'
        }}>
          <span style={{ fontSize: '16px' }}>Hide Comments</span>
          <Toggle checked={hidden} onChange={handleCommentsToggle} />
        </label>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntentionProvider>
      <App />
    </IntentionProvider>
  </React.StrictMode>
);