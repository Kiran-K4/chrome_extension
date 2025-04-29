import { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  const [hidden, setHidden] = useState(false)

  // initialise button text from storage
  useEffect(() => {
    chrome.storage.local.get('commentsHidden', ({ commentsHidden }) => {
      setHidden(commentsHidden === true)
    })
  }, [])

  const toggle = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    if (!tab?.id) return

    chrome.tabs.sendMessage(
      tab.id,
      { action: 'toggleComments' },
      (res) => {
        if (!chrome.runtime.lastError && res?.status) {
          setHidden(res.status === 'hidden')
        }
      }
    )
  }

  return (
    <div style={{ padding: 16, width: 200 }}>
      <h1>Focus Bear</h1>
      <button onClick={toggle}>
        {hidden ? 'Show comments' : 'Hide comments'}
      </button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)