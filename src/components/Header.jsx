import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header({ onCartOpen }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`} role="banner">
      <div className="container header-inner">
        <Link to="/" className="logo" aria-label="FreshMart Home">
          <span className="logo-icon" aria-hidden="true">🛒</span>
          <span className="logo-text">Fresh<strong>Mart</strong></span>
        </Link>

        <form className="search-form" onSubmit={handleSearch} role="search">
          <label htmlFor="header-search" className="sr-only">Search products</label>
          <input
            id="header-search"
            type="search"
            placeholder="Search fresh products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="submit" aria-label="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </form>

        <nav className={`nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/shop" className={location.pathname === '/shop' ? 'active' : ''}>Shop</Link>
          {user ? (
            <>
              <Link to="/orders" className={location.pathname === '/orders' ? 'active' : ''}>Orders</Link>
              <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                <span className="user-avatar" aria-hidden="true">{user.name?.charAt(0).toUpperCase()}</span>
                {user.name?.split(' ')[0]}
              </Link>
              <button className="btn-logout" onClick={handleLogout} aria-label="Log out">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-nav-login">Login</Link>
              <Link to="/register" className="btn-nav-register">Sign Up</Link>
            </>
          )}
        </nav>

        <div className="header-actions">
          <button className="cart-btn" onClick={onCartOpen} aria-label={`Open cart, ${count} items`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {count > 0 && <span className="cart-badge" aria-hidden="true">{count > 99 ? '99+' : count}</span>}
          </button>

          <button
            className={`menu-toggle${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span/><span/><span/>
          </button>
        </div>
      </div>
    </header>
  );
}
