import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Schedules from './pages/Schedules/Schedules';
import BellTypes from './pages/BellTypes/BellTypes';
import Logs from './pages/Logs/Logs';
import Settings from './pages/Settings/Settings';
import Holidays from './pages/Holidays/Holidays';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('smartbell_token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="bells" element={<BellTypes />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="holidays" element={<Holidays />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
