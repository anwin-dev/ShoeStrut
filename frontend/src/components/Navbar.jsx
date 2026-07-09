import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { count, setDrawerOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container container">
        <button
          type="button"
          className="nav-mobile-toggle"
          aria-label="Menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-mark">S</span>
          <span>StepStyle</span>
        </Link>

        <nav className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/shop" onClick={() => setMenuOpen(false)}>
            Shop
          </NavLink>
          <NavLink to="/wishlist" onClick={() => setMenuOpen(false)}>
            Wishlist
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
              Account
            </NavLink>
          )}

          <form className="nav-search mobile-only" onSubmit={onSearch}>
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shoes..."
            />
          </form>
        </nav>

        <div className="navbar-actions">
          <form className="nav-search desktop-only" onSubmit={onSearch}>
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shoes..."
            />
          </form>

          <Link to="/wishlist" className="btn-icon" aria-label="Wishlist">
            <Heart size={18} />
          </Link>

          <button
            type="button"
            className="btn-icon cart-btn"
            aria-label="Cart"
            onClick={() => setDrawerOpen(true)}
          >
            <ShoppingBag size={18} />
            {count > 0 && <span className="cart-count">{count}</span>}
          </button>

          {isAuthenticated ? (
            <div className="nav-user">
              <Link to="/profile" className="btn-icon" aria-label="Profile">
                <User size={18} />
              </Link>
              <button type="button" className="btn btn-sm btn-outline desktop-only" onClick={logout}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-sm btn-primary">
              Sign in
            </Link>
          )}
        </div>
      </div>
      {isAuthenticated && (
        <p className="nav-hello container desktop-only">Welcome back, {user?.username}</p>
      )}
    </header>
  );
};

export default Navbar;
