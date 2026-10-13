import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import UploadDetect from './pages/UploadDetect';
import DatasetPrep from './pages/DatasetPrep';
import TrainingGuide from './pages/TrainingGuide';
import Reports from './pages/Reports';
import History from './pages/History';
import About from './pages/About';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-navy-900 text-slate-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/detect" element={<UploadDetect />} />
            <Route path="/dataset-prep" element={<DatasetPrep />} />
            <Route path="/training-guide" element={<TrainingGuide />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
