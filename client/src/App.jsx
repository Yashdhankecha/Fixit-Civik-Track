import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { IssueProvider } from './contexts/IssueContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Layout Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ReportIssuePage from './pages/ReportIssuePage';
import IssueDetailPage from './pages/IssueDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationPage from './pages/NotificationPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-secondary-600 mb-6">
              We're working on fixing the problem. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-secondary-50">
    <div className="text-center">
      <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
      <p className="text-secondary-600">Loading FixIt...</p>
    </div>
  </div>
);

function App() {
  // Custom Fallback Component
  const CustomFallback = () => {
    const { isAdmin } = useAuth();
    return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
  };
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <LocationProvider>
            <IssueProvider>
              <NotificationProvider>
              <div className="App">
                <AnimatePresence mode="wait">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <ProtectedRoute adminOnly>
                        <Layout>
                          <AdminDashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* User Routes - Only accessible to non-admin users */}
                    <Route path="/" element={
                      <ProtectedRoute userOnly>
                        <Layout>
                          <HomePage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/map" element={
                      <ProtectedRoute userOnly>
                        <Layout>
                          <MapPage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/report" element={
                      <ProtectedRoute userOnly>
                        <Layout>
                          <ReportIssuePage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/issue/:id" element={
                      <ProtectedRoute userOnly>
                        <Layout>
                          <IssueDetailPage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute userOnly>
                        <Layout>
                          <ProfilePage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/notifications" element={
                      <ProtectedRoute userOnly>
                        <Layout>
                          <NotificationPage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/settings" element={
                      <ProtectedRoute userOnly>
                        <Layout>
                          <SettingsPage />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Fallback */}
                    <Route path="*" element={<CustomFallback />} />
                  </Routes>
                </AnimatePresence>
                
                {/* Global Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#fff',
                      color: '#374151',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
                      border: '1px solid #e5e7eb',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
                          </NotificationProvider>
            </IssueProvider>
          </LocationProvider>
        </AuthProvider>
        </Router>
      </ErrorBoundary>
  );
}

export default App; 