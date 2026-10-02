import React, { useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserPlus, 
  FaStore, 
  FaArrowLeft
} from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service & Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/users/register', { name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h4 className="fw-bold text-dark mt-2 mb-1">Create Account</h4>
          <p className="text-muted small mb-0">Fill in your credentials to register</p>
        </div>

        {/* Tab Switcher */}
        <div className="elite-tab-switcher">
          <button 
            type="button" 
            className="elite-tab-btn"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <button type="button" className="elite-tab-btn active">
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" className="py-2 px-3 mb-3 small d-flex align-items-center border-0 rounded-3 shadow-sm">
            <span>{error}</span>
          </Alert>
        )}

        {/* Registration Credentials Form */}
        <form onSubmit={submitHandler}>
          
          {/* Full Name Field */}
          <div className="elite-input-group">
            <FaUser className="elite-input-icon" />
            <input 
              type="text"
              className="elite-input-field"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
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

          {/* Confirm Password Field */}
          <div className="elite-input-group">
            <FaLock className="elite-input-icon" />
            <input 
              type={showConfirmPassword ? 'text' : 'password'}
              className="elite-input-field"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button 
              type="button" 
              className="elite-password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex="-1"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="mb-4 small">
            <label className="d-flex align-items-center gap-2 text-muted mb-0" style={{ cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                className="form-check-input mt-0" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span>
                I agree to the <a href="#" onClick={(e) => e.preventDefault()} className="text-primary text-decoration-none">Terms & Conditions</a>
              </span>
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <FaUserPlus />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        {/* Switch to Sign In */}
        <div className="text-center mt-4 pt-2">
          <p className="text-muted small mb-3">
            Already have an account?{' '}
            <Link to="/login" className="text-primary fw-bold text-decoration-none">
              Sign In
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

export default Register;