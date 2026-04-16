import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css';
import { ProfileProvider } from './context/ProfileContext.jsx';

createRoot(document.getElementById('root')).render(
  <ProfileProvider>
    <App />
  </ProfileProvider>,
)
