import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customToast } from '../../utils/toastUtils';
import './Navbar.css';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/youtube', label: 'Tutorials' },
  { path: '/code-review', label: 'Code Review' },
  { path: '/roadmaps', label: 'Roadmaps' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector('.navbar-link.active');
    if (activeLink) {
      setIndicator({
        left: activeLink.offsetLeft,
        width: activeLink.offsetWidth,
      });
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    navigate('/login', { replace: true });
    customToast.success("Logged out successfully");
    await logout();
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-logo">LearnFlow AI</span>

        <div className="navbar-center" ref={navRef}>
          <div
            className="navbar-indicator"
            style={{ left: indicator.left, width: indicator.width }}
          />
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-profile-wrapper" ref={dropdownRef}>
          <button className="navbar-profile-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <svg className={`navbar-chevron ${dropdownOpen ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="navbar-dropdown">
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </Link>
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
