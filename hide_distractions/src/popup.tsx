import React from 'react';
import ReactDOM from 'react-dom/client';
import { IntentionProvider } from './context/intentionPopupContext';
import Sidebarblur from './Sidebarblur'; 

const App = () => {
  return (
    <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>Focus Bear</h1>
      <Sidebarblur />
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
