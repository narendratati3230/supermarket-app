import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartSidebar.css';

export default function CartSidebar({ isOpen, onClose }) {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  return (
    <>
      <div
        className={`cart-overlay${isOpen ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`cart-sidebar${isOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="cart-header">
          <h2>Your Cart <span className="cart-item-count">{items.length} items</span></h2>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon" aria-hidden="true">🛒</span>
            <p>Your cart is empty</p>
            <Link to="/shop" className="btn-shop-now" onClick={onClose}>Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="cart-items" role="list">
              {items.map(item => (
                <div key={item.id} className="cart-item" role="listitem">
                  <span className="cart-item-emoji" aria-hidden="true">{item.emoji}</span>
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                  <div className="cart-qty" role="group" aria-label={`Quantity for ${item.name}`}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease quantity">−</button>
                    <span aria-live="polite">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <button className="cart-remove" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-totals">
                <div className="cart-total-row">
                  <span>Subtotal</span><span>${total.toFixed(2)}</span>
                </div>
                <div className="cart-total-row">
                  <span>Delivery</span><span className="free-tag">FREE</span>
                </div>
                <div className="cart-total-row total">
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-checkout" onClick={onClose}>
                Proceed to Checkout →
              </Link>
              <button className="btn-clear" onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
