import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo" aria-label="FreshMart Home">
            <span aria-hidden="true">🛒</span> Fresh<strong>Mart</strong>
          </Link>
          <p>Your neighbourhood supermarket, delivered fresh to your door. Quality produce, every day.</p>
          <div className="footer-badges" aria-label="Security and payment badges">
            <span>🔒 Secure Checkout</span>
            <span>💳 Safe Payments</span>
            <span>🚚 Free Delivery</span>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <div className="footer-col">
            <h3>Shop</h3>
            <Link to="/shop">All Products</Link>
            <Link to="/shop?cat=fruits">Fruits & Veg</Link>
            <Link to="/shop?cat=dairy">Dairy & Eggs</Link>
            <Link to="/shop?cat=meat">Meat & Seafood</Link>
            <Link to="/shop?cat=bakery">Bakery</Link>
          </div>
          <div className="footer-col">
            <h3>Account</h3>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
          </div>
          <div className="footer-col">
            <h3>Support</h3>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact Us</a>
            <a href="#delivery">Delivery Info</a>
            <a href="#returns">Returns</a>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {new Date().getFullYear()} FreshMart. All rights reserved.</p>
          <div className="footer-payment-icons" aria-label="Accepted payment methods">
            <span>VISA</span><span>MC</span><span>AMEX</span><span>PayPal</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
