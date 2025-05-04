import React from 'react'
import ReactDOM from 'react-dom/client'
import { IntentionProvider } from './context/intentionPopupContext'


const App = () => {
  return (
    <div style={{ padding: 16 }}>
      <h1>Focus</h1>
      <button onClick={() => alert('Distractions hidden!')}>Click me</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>
  <IntentionProvider>
    <App />
  </IntentionProvider>
</React.StrictMode>)