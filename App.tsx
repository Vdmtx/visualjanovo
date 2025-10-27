
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ResultsPage } from './pages/ResultsPage';
import { ToastProvider } from './components/ui/Toast';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/criar" element={<CreateProjectPage />} />
          <Route path="/resultado/:projectId" element={<ResultsPage />} />
          {/* Add a catch-all route for 404 or redirect */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;
