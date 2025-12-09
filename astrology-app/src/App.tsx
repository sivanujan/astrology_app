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

// Wrapper component to consume chart data for routing logic
const AppRoutes = () => {
  const { chartData } = useChartData();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<InputForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Semi-Protected / Public but needs data */}
      <Route
        path="/chart"
        element={chartData ? <SouthIndianChart data={chartData} /> : <Navigate to="/" />}
      />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/analysis" element={
        <ProtectedRoute>
          {chartData ? <ChartAnalysis data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/dasha" element={
        <ProtectedRoute>
          {chartData ? <DashaPeriods data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/predictions" element={
        <ProtectedRoute>
          {chartData ? <AIPredictions data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/predictions-faq" element={
        <ProtectedRoute>
          {chartData ? <GurujiPredictions data={chartData} /> : <Navigate to="/" />}
        </ProtectedRoute>
      } />

      <Route path="/daily-snapshot" element={
        <ProtectedRoute>
          {chartData ? <DailySnapshot data={chartData} /> : <Navigate to="/" />}
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
