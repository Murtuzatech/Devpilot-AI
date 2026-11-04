import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import CodeReview from './pages/CodeReview';
import BugDetective from './pages/BugDetective';
import TestGenerator from './pages/TestGenerator';
import Projects from './pages/Projects';
import InterviewPrep from './pages/InterviewPrep';
import DSAPractice from './pages/DSAPractice';
import CodePlayground from './pages/CodePlayground';
import DevChatAI from './pages/DevChatAI';
import Performance from './pages/Performance';
import Settings from './pages/Setting';
import Login from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="code-review" element={<CodeReview />} />
            <Route path="bug-detective" element={<BugDetective />} />
            <Route path="test-generator" element={<TestGenerator />} />
            <Route path="projects" element={<Projects />} />
            <Route path="interview-prep" element={<InterviewPrep />} />
            <Route path="dsa" element={<DSAPractice />} />
            <Route path="playground" element={<CodePlayground />} />
            <Route path="chat" element={<DevChatAI />} />
            <Route path="dev-chat" element={<DevChatAI />} />
            <Route path="performance" element={<Performance />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}