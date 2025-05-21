
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add any additional CSS for sidebar if needed
document.documentElement.style.setProperty('--sidebar-width', '250px');
document.documentElement.style.setProperty('--sidebar-width-icon', '80px');

createRoot(document.getElementById("root")!).render(<App />);

// force update

// force update
