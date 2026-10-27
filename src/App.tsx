import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Public Welcome / Landing Page */}
        <Route path="/" element={<Welcome />} />

        {/* 2. Login & Sign Up Page */}
        <Route path="/login" element={<Login />} />

        {/* 3. Authenticated Developer Workspace */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          {/* AI Tools ke baki routes agle phases me yahan aayenge */}
        </Route>

        {/* 4. Unknown routes redirect to Welcome */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}