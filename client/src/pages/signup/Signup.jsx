import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { customToast } from '../../utils/toastUtils';
import '../login/Login.css';
import './Signup.css';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup({ username, email, password });
      customToast.success("Account created!");
      navigate('/login');
    } catch (err) {
      customToast.error(err.response?.data?.message || "Signup failed");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="auth-page">
      {/* ── Global Header ── */}
      <div className="auth-global-header">
        <div className="auth-hero-top-left">
          <div className="auth-hero-logo-shape"></div>
        </div>
        <div className="auth-nav-links">
          <a href="#">Features</a>
          <a href="#">How it Works</a>
          <a href="#">FAQ</a>
        </div>
      </div>

      {/* ── Left Hero Panel ── */}
      <div className="auth-hero">
        {/* Decorative solid background curves */}
        <div className="auth-curve auth-curve-1"></div>
        <div className="auth-curve auth-curve-2"></div>

        <div className="auth-chevrons auth-chevrons-top">
          <svg width="48" height="72" viewBox="0 0 48 72" fill="none">
            <path d="M4 4L24 20L44 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20L24 36L44 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 36L24 52L44 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 52L24 68L44 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="auth-chevrons auth-chevrons-bottom">
          <svg width="48" height="72" viewBox="0 0 48 72" fill="none">
            <path d="M4 4L24 20L44 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20L24 36L44 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 36L24 52L44 36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 52L24 68L44 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="auth-hero-content">
          <div className="auth-hero-stat">
            <span className="auth-stat-text">Everything you need to learn smarter</span>
          </div>

          <div className="auth-hero-label">
            <span className="auth-label-line"></span>
            <span>Join the Platform</span>
          </div>

          <h1 className="auth-hero-title">
            LearnFlow <span className="auth-hero-highlight">AI</span>
          </h1>

          <p className="auth-hero-subtitle">
            Master any skill with AI-guided learning paths
          </p>

          <ul className="auth-hero-features">
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Personalized Roadmaps
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              AI-powered Quizzes
            </li>
            <li>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Smart Progress Tracking
            </li>
          </ul>

          <Link to="/login" className="auth-hero-cta">
            Sign In
          </Link>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-card-title">Create Account</h2>

          <form onSubmit={handleSubmit} className="auth-card-form">
            <div className="auth-input-group">
              <input
                id="signup-username"
                type="text"
                className="auth-input"
                placeholder="Choose a Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {username && (
                <svg className="auth-input-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>

            <div className="auth-input-group">
              <input
                id="signup-email"
                type="email"
                className="auth-input"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {email && (
                <svg className="auth-input-check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>

            <div className="auth-input-group">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="auth-input-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <p className="auth-terms">
              By signing up, you agree to our <a href="#">Terms & Conditions</a>
            </p>

            <div className="auth-actions-row">
              <button type="submit" className="auth-submit-btn">
                Create Account
              </button>
            </div>
          </form>

          <div className="auth-divider-line">
            <span>or continue with</span>
          </div>

          <button type="button" className="auth-google-btn" onClick={handleGoogleSignup}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google
          </button>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login" className="auth-switch-link">Login</Link>
          </p>
        </div>
        
        <div className="auth-chevrons auth-chevrons-card">
          <svg width="48" height="72" viewBox="0 0 48 72" fill="none">
            <path d="M4 4L24 20L44 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20L24 36L44 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 36L24 52L44 36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 52L24 68L44 52" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── Global Footer ── */}
      <div className="auth-global-footer">
        <div className="auth-footer-left">
          <span>learnflowai101@gmail.com</span>
          <span className="auth-footer-divider">|</span>
          <a href="#">Terms & Conditions</a>
          <span className="auth-footer-divider">|</span>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
