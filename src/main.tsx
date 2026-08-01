import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/echlearn.css'
import './i18n';
import App from './App'
import { useAuthStore } from './stores/authStore'
import { useAppStore } from './stores/appStore'

useAuthStore.getState().initialize()

// Ensure light mode theme class is initialized on HTML root
const activeTheme = useAppStore.getState().theme || 'light';
document.documentElement.classList.toggle('dark', activeTheme === 'dark');
document.documentElement.classList.toggle('light', activeTheme === 'light');
document.documentElement.dataset.theme = activeTheme;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
