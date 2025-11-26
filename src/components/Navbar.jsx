import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <span className="text-2xl font-bold">📚 Attendify</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="flex space-x-1 md:space-x-2 items-center">
            {user ? (
              <>
                <Link to="/dashboard" className="navbar-link">
                  Dashboard
                </Link>

                {/* Teacher/Admin Only Links */}
                {user.role === 'admin' && (
                  <>
                    <Link to="/classes" className="navbar-link">
                      Classes
                    </Link>
                    <Link to="/students" className="navbar-link">
                      Students
                    </Link>
                    {/* Reports link removed */}
                  </>
                )}

                {/* Student Only Links */}
                {user.role === 'student' && (
                  <>
                    {/* My Attendance link removed */}
                  </>
                )}

                <div className="h-6 w-px bg-white/30 mx-2"></div>
                <span className="text-white/80 text-sm px-2">
                  {user.name} 
                  <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded">
                    {user.role === 'admin' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                  </span>
                </span>
                <button 
                  onClick={handleLogout} 
                  className="navbar-link bg-red-500/20 hover:bg-red-500/40"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="navbar-link">
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
