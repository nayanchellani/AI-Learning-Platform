import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { customToast } from '../../utils/toastUtils';
import Profile from '../profile/Profile';
import './Navbar.css';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/youtube', label: 'Search' },
  { path: '/code-review', label: 'Code Review' },
  { path: '/roadmaps', label: 'Roadmaps' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
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
    <>
    <nav className="navbar desktop-nav">
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
              className={`navbar-link ${location.pathname === link.path || (link.path === '/dashboard' && location.pathname === '/') ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-profile-wrapper" ref={dropdownRef}>
          <button className={`navbar-profile-btn ${location.pathname === '/profile' ? 'active' : ''}`} onClick={() => setDropdownOpen(!dropdownOpen)} aria-label="Open profile menu" aria-expanded={dropdownOpen}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <svg className={`navbar-chevron ${dropdownOpen ? 'rotated' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="navbar-dropdown">
              <button className="dropdown-item" onClick={() => { setDropdownOpen(false); setProfileOpen(true); }} aria-label="View profile">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>
              <button className="dropdown-item dropdown-logout" onClick={handleLogout} aria-label="Logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

    {/* Mobile Bottom Navigation */}
    <nav className="mobile-bottom-nav">
      <Link to="/dashboard" className={`bottom-nav-item ${location.pathname === '/dashboard' || location.pathname === '/' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
        <span>Dashboard</span>
      </Link>
      <Link to="/youtube" className={`bottom-nav-item ${location.pathname === '/youtube' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <span>Search</span>
      </Link>
      <Link to="/roadmaps" className={`bottom-nav-item ${location.pathname === '/roadmaps' ? 'active' : ''}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        <span>Roadmaps</span>
      </Link>
      <button className={`bottom-nav-item ${profileOpen ? 'active' : ''}`} onClick={() => setProfileOpen(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        <span>Profile</span>
      </button>
    </nav>

    <Profile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
};

export default Navbar;
