import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import InputForm from './components/InputForm';
import SouthIndianChart from './components/SouthIndianChart';
import ChartAnalysis from './components/ChartAnalysis';
import AIPredictions from './components/AIPredictions';
import DashaPeriods from './components/DashaPeriods';
import GurujiPredictions from './components/GurujiPredictions';
import DailySnapshot from './components/DailySnapshot';

// Placeholder components until we implement them
const Placeholder = ({ title }: { title: string }) => (
  <div className="glass-panel p-8 text-center">
    <h2 className="text-3xl font-bold mb-4">{title}</h2>
    <p className="text-slate-400">Coming soon...</p>
  </div>
);

function App() {
  // Global state for chart data
  const [chartData, setChartData] = useState<any>(null);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<InputForm setChartData={setChartData} />} />
          <Route
            path="/chart"
            element={chartData ? <SouthIndianChart data={chartData} /> : <Navigate to="/" />}
          />
          <Route
            path="/analysis"
            element={chartData ? <ChartAnalysis data={chartData} /> : <Navigate to="/" />}
          />
          <Route
            path="/dasha"
            element={chartData ? <DashaPeriods data={chartData} /> : <Navigate to="/" />}
          />
          <Route
            path="/predictions"
            element={chartData ? <AIPredictions data={chartData} /> : <Navigate to="/" />}
          />
          <Route
            path="/predictions-faq"
            element={chartData ? <GurujiPredictions data={chartData} /> : <Navigate to="/" />}
          />
          <Route
            path="/daily-snapshot"
            element={chartData ? <DailySnapshot data={chartData} /> : <Navigate to="/" />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
