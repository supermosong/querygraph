import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';

function App() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !light);
    document.body.className = light
      ? 'bg-gray-50 text-gray-900 antialiased'
      : 'bg-gray-950 text-white antialiased';
  }, [light]);

  return (
    <BrowserRouter>
      <Navbar light={light} setLight={setLight} />
      <Routes>
        <Route path="/"          element={<Home      light={light} />} />
        <Route path="/dashboard" element={<Dashboard light={light} />} />
        <Route path="/pricing"   element={<Pricing   light={light} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
