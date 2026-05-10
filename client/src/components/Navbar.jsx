import React from 'react';
import { Link } from 'react-router-dom';

// Top navigation bar with the app logo and nav links
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
      </div>
    </nav>
  );
}

export default Navbar;
