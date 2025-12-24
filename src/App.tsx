import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ChartProvider, useChartData } from './contexts/ChartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import SouthIndianChart from './components/SouthIndianChart';
import ChartAnalysis from './components/ChartAnalysis';
import AIPredictions from './components/AIPredictions';
import DashaPeriods from './components/DashaPeriods';
import GurujiPredictions from './components/GurujiPredictions';
import DailySnapshot from './components/DailySnapshot';
import MarriageMatching from './pages/MarriageMatching';
import MatchingResults from './pages/MatchingResults';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SEO from './components/SEO';
import InstallPWA from './components/InstallPWA';

const AppRoutes = () => {
  const { chartData, setChartData } = useChartData();

  // ... (existing hydration logic)
  const hasData = chartData || localStorage.getItem('astrology_chart_data');

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
        <>
          <SEO title="Login" />
          <Login />
        </>
      } />
      <Route path="/register" element={
        <>
          <SEO title="Create Account" />
          <Register />
        </>
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
        <ProtectedRoute>
          {hasData ? (
            <>
              <SEO title="Detailed Chart Analysis" />
              <ChartAnalysis data={chartData} />
            </>
          ) : <Navigate to="/" />}
        </ProtectedRoute>
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
          <SEO title="Marriage Matching - Compatibility Analysis" />
          <MarriageMatching />
        </ProtectedRoute>
      } />
      <Route path="/matching-results" element={
        <ProtectedRoute requireAuth={false}>
          <SEO title="Marriage Matching Results" />
          <MatchingResults />
        </ProtectedRoute>
      } />
    </Routes>
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
