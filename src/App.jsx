import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useRepublic } from './store';
import { useToast } from './components/Toast';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Constitution from './pages/Constitution';
import Legislature from './pages/Legislature';
import Judiciary from './pages/Judiciary';
import Executive from './pages/Executive';
import Setup from './pages/Setup';

export default function App() {
  const republic = useRepublic();
  const { showToast, ToastContainer } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!republic.data.republic.setupComplete) {
    return <Setup onSetup={republic.setupRepublic} />;
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <button
          className="mobile-nav-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </button>

        <Sidebar
          republicName={republic.data.republic.name}
          motto={republic.data.republic.motto}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard republic={republic} />}
            />
            <Route
              path="/constitution"
              element={
                <Constitution republic={republic} showToast={showToast} />
              }
            />
            <Route
              path="/legislature"
              element={
                <Legislature republic={republic} showToast={showToast} />
              }
            />
            <Route
              path="/judiciary"
              element={
                <Judiciary republic={republic} showToast={showToast} />
              }
            />
            <Route
              path="/executive"
              element={
                <Executive republic={republic} showToast={showToast} />
              }
            />
          </Routes>
        </main>

        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}
