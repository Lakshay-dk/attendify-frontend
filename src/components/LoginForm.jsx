import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userData = await login(email, password);
      
      // Check if the logged-in user's role matches the selected role
      if (userData.role !== role) {
        setError(`This account is a ${userData.role}, not a ${role}. Please use the correct role.`);
        setLoading(false);
        return;
      }
      
      navigate('/dashboard');
    } catch (error) {
      setError(error || 'Login failed. Please check your credentials.');
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Login Form</h2>
      
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
      
          <div className="mb-6">
            <label htmlFor="role" className="label-field">Login As</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
      
          <div className="mb-6">
            <label htmlFor="email" className="label-field">Email or Phone</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
              required
            />
          </div>
      
          <div className="mb-4">
            <label htmlFor="password" className="label-field">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="text-right mb-6">
            <Link to="/forgot-password" className="text-sm link-text">Forgot Password?</Link>
          </div>
      
          <button type="submit" disabled={loading} className="btn-primary w-full mb-4">
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>

          <div className="text-center text-sm text-gray-600">
            New student? <Link to="/register" className="link-text font-semibold">Register now</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
