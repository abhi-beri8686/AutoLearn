import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage';
import QuizPage from './pages/QuizPage';
import DashboardPage from './pages/DashboardPage';
import LearningPathPage from './pages/LearningPathPage';
import ResourcesPage from './pages/ResourcesPage';
import GoalSelectionPage from './pages/GoalSelectionPage';
import TutorPage from './pages/TutorPage';
import InterviewPage from './pages/InterviewPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-mesh grid-bg text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Public Landing & Authentication */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />

              {/* Protected Project Routes */}
              <Route path="start" element={<ProtectedRoute><StartPage /></ProtectedRoute>} />
              <Route path="goals" element={<ProtectedRoute><GoalSelectionPage /></ProtectedRoute>} />
              <Route path="quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
              <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="path" element={<ProtectedRoute><LearningPathPage /></ProtectedRoute>} />
              <Route path="resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
              <Route path="tutor" element={<ProtectedRoute><TutorPage /></ProtectedRoute>} />
              <Route path="interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}
