import React from 'react'
import ReactDOM from 'react-dom/client'

const App = () => {
  return (
    <div style={{ padding: 16 }}>
      <h1>Focus</h1>
      <button onClick={() => alert('Distractions hidden!')}>Click me</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)