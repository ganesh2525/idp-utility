import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HardwareTokens from './components/HardwareTokens';
import Welcome from './components/Welcome';
import PageNotFound from './components/PageNotFound';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/mfa/hardware-tokens" element={<HardwareTokens />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

