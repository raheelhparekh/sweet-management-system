import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import { User, Settings, LogOut, Home } from 'lucide-react';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch {
      toast.error('Logout failed, but you have been logged out locally.');
      navigate('/');
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
              Sweet Delights
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200"
            >
              <Home size={18} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-600 hover:text-pink-600 font-medium rounded-lg hover:bg-pink-50 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {user?.isAdmin && (
                  <Link 
                    to="/admin-dashboard" 
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
                  >
                    <Settings size={18} />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <User size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {user?.username}
                  </span>
                </div>
                
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;