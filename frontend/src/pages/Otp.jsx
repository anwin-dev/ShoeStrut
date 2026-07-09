import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Otp = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp } = useAuth();
  const signupToken = location.state?.signupToken || sessionStorage.getItem('signupToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!signupToken) {
        setError('Signup session expired. Please sign up again.');
        return;
      }
      await verifyOtp(otp, signupToken);
      sessionStorage.removeItem('signupToken');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <ShieldCheck className="auth-icon" />
          </div>
          <h2>Verify OTP</h2>
          <p>Enter the code sent to your email (dev fallback: 123456)</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">OTP</label>
            <input
              id="otp"
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter 6-digit OTP"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Wrong email? <Link to="/signup" className="auth-link">Sign up again</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Otp;
