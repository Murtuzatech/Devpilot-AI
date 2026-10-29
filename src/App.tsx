import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './lib/firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Welcome from './pages/Welcome';
import CodeReview from './pages/CodeReview';
import DashboardLayout from './layouts/DashboardLayout';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-cyan-400 font-mono text-sm">
        Initializing DevPilot AI...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Welcome Landing Page */}
        <Route path="/" element={<Welcome />} />

        {/* Authentication */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />

        {/* Dashboard Layout with Nested Child Routes */}
        <Route
          path="/dashboard"
          element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="code-review" element={<CodeReview />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;