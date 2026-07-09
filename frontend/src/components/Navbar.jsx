import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Search, ShoppingBag, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout, initializing } = useAuth();
  const { count: cartCount, setDrawerOpen } = useCart();
  const { count: wishCount } = useWishlist();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/otp'].includes(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMenuOpen(false);
    await logout();
    navigate('/');
  };

  const initials = user?.username?.slice(0, 2)?.toUpperCase() || 'SS';

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        <div className="navbar-left">
          <button
            type="button"
            className={`nav-mobile-toggle ${menuOpen ? 'open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="hamburger">
              <span />
              <span />
              <span />
            </span>
          </button>

          <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
            <span className="logo-mark">S</span>
            <span className="logo-text">StepStyle</span>
          </Link>
        </div>

        <nav className={`navbar-center ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>Shop</NavLink>
          <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</NavLink>
          {isAuthenticated && (
            <NavLink to="/profile" onClick={() => setMenuOpen(false)}>Account</NavLink>
          )}
          <form className="nav-search mobile-only" onSubmit={onSearch}>
            <Search size={16} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shoes..."
              aria-label="Search products"
            />
          </form>
        </nav>

        <div className="navbar-right">
          <form className="nav-search desktop-only" onSubmit={onSearch}>
            <Search size={16} aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shoes..."
              aria-label="Search products"
            />
          </form>

          <Link to="/wishlist" className="btn-icon nav-wish" aria-label={`Wishlist${wishCount ? `, ${wishCount} items` : ''}`}>
            <Heart size={18} className={wishCount > 0 ? 'icon-filled' : ''} />
            {wishCount > 0 && <span className="nav-badge wish-badge">{wishCount}</span>}
          </Link>

          <button
            type="button"
            className="btn-icon nav-cart"
            aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`}
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="nav-badge cart-badge">{cartCount}</span>}
          </button>

          {!initializing && (
            isAuthenticated ? (
              <div className="nav-profile-wrap desktop-only" ref={profileRef}>
                <button
                  type="button"
                  className="nav-avatar"
                  aria-label="Account menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((v) => !v)}
                >
                  <span>{initials}</span>
                  <ChevronDown size={14} className={`chev ${profileOpen ? 'open' : ''}`} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="nav-dropdown"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="nav-dropdown-hello">Hi, {user?.username}</p>
                      <Link to="/profile" onClick={() => setProfileOpen(false)}>
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/wishlist" onClick={() => setProfileOpen(false)}>
                        <Heart size={16} /> Wishlist
                      </Link>
                      <button type="button" onClick={handleLogout}>
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              !isAuthPage && (
                <Link to="/login" className="btn btn-sm btn-primary nav-signin desktop-only">
                  Sign in
                </Link>
              )
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
