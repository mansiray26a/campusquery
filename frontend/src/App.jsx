import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

import './styles/global.css';

// Common pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student/user pages
import UserDashboard from './user/UserDashboard';
import AskQuestion from './user/AskQuestion';
import AllQuestions from './user/AllQuestions';
import QuestionDetails from './user/QuestionDetails';
import MyQuestions from './user/MyQuestions';
import Profile from './user/Profile';
import EditProfile from './user/EditProfile';

// Admin pages
import AdminDashboard from './admin/AdminDashboard';
import ManageUsers from './admin/ManageUsers';
import ManageQuestions from './admin/ManageQuestions';
import ManageAnswers from './admin/ManageAnswers';
import ManageTags from './admin/ManageTags';
import Reports from './admin/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/questions" element={<AllQuestions />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/profile/:id" element={<Profile />} />

          {/* Student protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ask"
            element={
              <ProtectedRoute>
                <AskQuestion />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-questions"
            element={
              <ProtectedRoute>
                <MyQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <ManageUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <AdminRoute>
                <ManageQuestions />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/answers"
            element={
              <AdminRoute>
                <ManageAnswers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tags"
            element={
              <AdminRoute>
                <ManageTags />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminRoute>
                <Reports />
              </AdminRoute>
            }
          />

          {/* Catch-all Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
