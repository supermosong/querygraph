// Navbar.jsx — top navigation bar with logo and nav links
import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-blue-600 tracking-tight">
        QueryGraph
      </Link>
      <div className="flex gap-6">
        <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
          Home
        </Link>
        <Link to="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">
          Pricing
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
