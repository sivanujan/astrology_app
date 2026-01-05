import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ChartProvider, useChartData } from './contexts/ChartContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import SouthIndianChart from './components/SouthIndianChart';
import ChartAnalysis from './components/ChartAnalysis';
import AIPredictions from './components/AIPredictions';
import DashaPeriods from './components/DashaPeriods';
import GurujiPredictions from './components/GurujiPredictions';
import DailySnapshot from './components/DailySnapshot';
import MarriageMatching from './pages/MarriageMatching';
import ComprehensiveMarriageMatching from './pages/ComprehensiveMarriageMatching';
import ComprehensiveResultsPage from './pages/ComprehensiveResultsPage';
import MatchingResults from './pages/MatchingResults';
import MarriageTools from './pages/MarriageTools';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import DashaPredictionsPage from './pages/DashaPredictionsPage';
import SEO from './components/SEO';
import InstallPWA from './components/InstallPWA';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  const { chartData, setChartData } = useChartData();

  // ... (existing hydration logic)
  // Check if we have data in state, storage, or URL params (for sharing)
  // Check if we have data in state, storage, or URL params (for sharing)
  // Use useMemo to check synchronously on first render
  const urlParamsValid = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('n') && params.has('d') && params.has('t');
    }
    return false;
  }, []); // Empty dependency array means it checks once on mount, which is fine for initial route check

  const hasData = chartData || localStorage.getItem('astrology_chart_data') || urlParamsValid;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <>
          <SEO title="Free Horoscope & Astrology Predictions" description="Generate your complete Vedic Astrology chart and get instant predictions about career, marriage, and health." />
          <InputForm />
        </>
      } />
      <Route path="/login" element={
        <PublicRoute>
          <SEO title="Login" />
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <SEO title="Create Account" />
          <Register />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={
        <>
          <SEO title="Forgot Password" />
          <ForgotPassword />
        </>
      } />
      <Route path="/verify-email" element={
        <>
          <SEO title="Verify Email" />
          <EmailVerification />
        </>
      } />
      <Route path="/privacy" element={
        <>
          <SEO title="Privacy Policy" />
          <PrivacyPolicy />
        </>
      } />
      <Route path="/terms" element={
        <>
          <SEO title="Terms of Service" />
          <TermsOfService />
        </>
      } />


      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={
        <>
          <SEO title="Admin Login" />
          <AdminLogin />
        </>
      } />
      <Route path="/admin/dashboard" element={
        <>
          <SEO title="Admin Dashboard" />
          <AdminDashboard />
        </>
      } />

      {/* Semi-Protected / Public but needs data */}
      <Route
        path="/chart"
        element={hasData ? (
          <>
            <SEO title="Your Birth Chart (Rasi & Navamsa)" />
            <SouthIndianChart data={chartData} />
          </>
        ) : <Navigate to="/" />}
      />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <SEO title="Dashboard - Your Astrology Profile" />
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/analysis" element={
        hasData ? (
          <>
            <SEO title="Detailed Chart Analysis" />
            <ChartAnalysis data={chartData} />
          </>
        ) : <Navigate to="/" />
      } />

      <Route path="/dasha" element={
        hasData ? (
          <>
            <SEO title="Dasa Bhukti Periods - Timeline" />
            <DashaPeriods data={chartData} />
          </>
        ) : <Navigate to="/" />
      } />

      <Route path="/predictions" element={
        <ProtectedRoute>
          {hasData ? (
            <>
              <SEO title="AI Predictions - Chat & Guidance" />
              <AIPredictions data={chartData} />
            </>
          ) : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/predictions-faq" element={
        <ProtectedRoute>
          {hasData ? (
            <>
              <SEO title="Life Guidance & Remedies" />
              <GurujiPredictions data={chartData} />
            </>
          ) : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/daily-snapshot" element={
        <ProtectedRoute>
          {hasData ? (
            <>
              <SEO title="Daily Horoscope Snapshot" />
              <DailySnapshot data={chartData} />
            </>
          ) : <Navigate to="/" />}
        </ProtectedRoute>
      } />


      <Route path="/marriage-matching" element={
        <ProtectedRoute requireAuth={false}>
          <SEO title="Marriage Matching - 7 Guruji Rules" />
          <ComprehensiveMarriageMatching />
        </ProtectedRoute>
      } />
      <Route path="/marriage-tools" element={
        <ProtectedRoute requireAuth={false}>
          <SEO title="Marriage Tools - Matching & Timing" />
          <MarriageTools />
        </ProtectedRoute>
      } />
      <Route path="/marriage-results" element={
        <ProtectedRoute requireAuth={false}>
          <SEO title="Marriage Matching Results" />
          <ComprehensiveResultsPage />
        </ProtectedRoute>
      } />
      <Route path="/comprehensive-results" element={
        <ProtectedRoute requireAuth={false}>
          <SEO title="Comprehensive Marriage Results" />
          <ComprehensiveResultsPage />
        </ProtectedRoute>
      } />

      {/* 404 Route */}
      <Route path="*" element={
        <>
          <SEO title="Page Not Found - Saturn Blocked This!" />
          <NotFound />
        </>
      } />
    </Routes >
  );
};

function App() {
  return (
    <HelmetProvider>
      <Router>
        <AuthProvider>
          <ChartProvider>
            <Layout>
              <AppRoutes />
              <InstallPWA />
            </Layout>
          </ChartProvider>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
}

export default App;
