import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './style.css';
import { ProfileProvider } from './context/ProfileContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ProfileProvider>
      <App />
    </ProfileProvider>
  </AuthProvider>,
)
