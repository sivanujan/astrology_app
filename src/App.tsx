import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

const AppRoutes = () => {
  const { chartData, setChartData } = useChartData();

  // Robust hydration check: If context is empty but storage has data, restore it immediately
  // This prevents the "Redirect to /" flash when reloading on protected pages
  React.useEffect(() => {
    if (!chartData) {
      try {
        const saved = localStorage.getItem('astrology_chart_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          setChartData(parsed);
        }
      } catch (e) {
        console.error("Hydration failed", e);
      }
    }
  }, [chartData, setChartData]);

  // Helper check for routing
  const hasData = chartData || localStorage.getItem('astrology_chart_data');

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<InputForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Semi-Protected / Public but needs data */}
      <Route
        path="/chart"
        element={hasData ? <SouthIndianChart data={chartData} /> : <Navigate to="/" />}
      />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/analysis" element={
        <ProtectedRoute>
          {hasData ? <ChartAnalysis data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/dasha" element={
        hasData ? <DashaPeriods data={chartData} /> : <Navigate to="/" />
      } />

      <Route path="/predictions" element={
        <ProtectedRoute>
          {hasData ? <AIPredictions data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/predictions-faq" element={
        <ProtectedRoute>
          {hasData ? <GurujiPredictions data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/daily-snapshot" element={
        <ProtectedRoute>
          {hasData ? <DailySnapshot data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ChartProvider>
          <Layout>
            <AppRoutes />
          </Layout>
        </ChartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
