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
            Profile ▼
          </button>

          {dropdownOpen && (
            <div className="navbar-dropdown">
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                Profile
              </Link>
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
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
