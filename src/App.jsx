import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import OpportunitiesPage from './pages/OpportunitiesPage';
import ApplicationsPage from './pages/ApplicationsPage';
import StudentsPage from './pages/StudentsPage';
import RemindersPage from './pages/RemindersPage';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/opportunities" element={<OpportunitiesPage />} />
            <Route path="/applications" element={<ApplicationsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
