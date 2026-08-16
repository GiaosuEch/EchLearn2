import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/echlearn.css'
import './i18n';
import App from './App'
import { useAuthStore } from './stores/authStore'
import { useAppStore } from './stores/appStore'
import { initializeAntiCloneShield } from './services/antiCloneShield'
import { EventBusService } from './lib/events/EventBus'
import { attachSRSStoreEvents } from './stores/srsStore'
import { attachMistakeNotebookEvents } from './stores/mistakeNotebookStore'

const globalEventBus = new EventBusService()
attachSRSStoreEvents(globalEventBus)
attachMistakeNotebookEvents(globalEventBus)

initializeAntiCloneShield()
useAuthStore.getState().initialize(globalEventBus)

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
