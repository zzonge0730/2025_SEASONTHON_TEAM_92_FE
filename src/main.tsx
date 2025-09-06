import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 브라우저 확장 프로그램 에러 무시
window.addEventListener('error', (event) => {
  if (event.filename && event.filename.includes('content_script')) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.stack && event.reason.stack.includes('content_script')) {
    event.preventDefault();
    return false;
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)