import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { IntentionProvider } from './context/intentionPopupContext'

const App = () => {
  const [blurEnabled, setBlurEnabled] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    chrome.storage.local.get('blurEnabled', ({ blurEnabled }) => {
      setBlurEnabled(blurEnabled !== false)
    })
    chrome.storage.local.get('commentsHidden', ({ commentsHidden }) => {
      setHidden(commentsHidden === true)
    })
  }, [])

  const handleBlurToggle = async () => {
    const newValue = !blurEnabled
    setBlurEnabled(newValue)
    chrome.storage.local.set({ blurEnabled: newValue })
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_BLUR', payload: newValue })
    }
  }

  const handleCommentsToggle = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.id) return
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'toggleComments' },
      res => {
        if (!chrome.runtime.lastError && res?.status) {
          setHidden(res.status === 'hidden')
        }
      }
    )
  }

  const containerStyle = {
    width: '380px',
    height: '300px',
    padding: 16,
    boxSizing: 'border-box' as const,
    fontFamily: 'sans-serif' as const,
    position: 'relative' as const,
  }

  const mainView = (
    <div>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Focus Bear</h1>
      <p style={{ marginBottom: 16 }}>placeholder</p>
      <img
        src={chrome.runtime.getURL('assets/settings.png')}
        alt="Settings"
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 24,
          height: 24,
          cursor: 'pointer',
        }}
        onClick={() => setShowSettings(true)}
      />
    </div>
  )

  const settingsView = (
    <div
      style={{
        // overlay filling the popup
        position: 'absolute' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          background: '#f9f9f9',
          padding: 24,
          borderRadius: 8,
          minWidth: 260,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Settings</h2>
        <label style={{ display: 'block', margin: '8px 0' }}>
          <input
            type="checkbox"
            checked={blurEnabled}
            onChange={handleBlurToggle}
          />{' '}
          Blur sidebar/chips
        </label>
        <label style={{ display: 'block', margin: '8px 0' }}>
          <input
            type="checkbox"
            checked={hidden}
            onChange={handleCommentsToggle}
          />{' '}
          Blur comments
        </label>
        <button
          style={{ marginTop: 16 }}
          onClick={() => setShowSettings(false)}
        >
          Close
        </button>
      </div>
    </div>
  )

  return (
    <div style={containerStyle}>
      {showSettings ? settingsView : mainView}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <IntentionProvider>
      <App />
    </IntentionProvider>
  </React.StrictMode>
)
