import React, { useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt, 
  FaStore, 
  FaArrowLeft
} from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const redirect = redirectParam ? (redirectParam.startsWith('/') ? redirectParam : `/${redirectParam}`) : '/';

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/users/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="elite-auth-page">
      <div className="elite-auth-card-clean">
        
        {/* Top Brand Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-2">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center text-primary shadow-sm"
              style={{ width: '44px', height: '44px', background: '#f1f5f9' }}
            >
              <FaStore size={22} />
            </div>
            <span className="fs-3 fw-bold text-dark tracking-wide">EliteShop</span>
          </Link>
          <h4 className="fw-bold text-dark mt-2 mb-1">Sign In</h4>
          <p className="text-muted small mb-0">Enter your credentials to access your account</p>
        </div>

        {/* Tab Switcher */}
        <div className="elite-tab-switcher">
          <button type="button" className="elite-tab-btn active">
            Sign In
          </button>
          <button 
            type="button" 
            className="elite-tab-btn" 
            onClick={() => navigate('/register')}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="py-2 px-3 mb-3 small d-flex align-items-center border-0 rounded-3 shadow-sm">
            <span>{error}</span>
          </Alert>
        )}

        {/* Login Credentials Form */}
        <form onSubmit={submitHandler}>
          
          {/* Email Field */}
          <div className="elite-input-group">
            <FaEnvelope className="elite-input-icon" />
            <input 
              type="email"
              className="elite-input-field"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* Password Field */}
          <div className="elite-input-group">
            <FaLock className="elite-input-icon" />
            <input 
              type={showPassword ? 'text' : 'password'}
              className="elite-input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button 
              type="button" 
              className="elite-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Remember Me Checkbox */}
          <div className="d-flex align-items-center mb-4 small">
            <label className="d-flex align-items-center gap-2 text-muted mb-0 cursor-pointer" style={{ cursor: 'pointer' }}>
              <input type="checkbox" className="form-check-input mt-0" defaultChecked />
              <span>Remember me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="elite-primary-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <FaSignInAlt />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="text-center mt-4 pt-2">
          <p className="text-muted small mb-3">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary fw-bold text-decoration-none">
              Create Account
            </Link>
          </p>
          
          <Link to="/" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1">
            <FaArrowLeft size={10} /> Back to Store
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;