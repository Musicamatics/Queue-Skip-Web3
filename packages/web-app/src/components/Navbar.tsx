import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">QS</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Queue Skip</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link 
                  to="/passes" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  My Passes
                </Link>
                <Link 
                  to="/community" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Community
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user.email || user.id}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
