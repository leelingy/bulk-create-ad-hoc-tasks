import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MainApp from './MainApp';
import QuickAddAdHocTask from './components/QuickAddAdHocTask';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/levvy-ai-notetaker" element={<MainApp />} />
        <Route path="/quick-add-task" element={<QuickAddAdHocTask />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

