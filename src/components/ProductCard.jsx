import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useToastMsg } from '../context/ToastContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const { addToast } = useToastMsg();
  const [adding, setAdding] = useState(false);
  const inCart = items.find(i => i.id === product.id);

  const handleAdd = () => {
    setAdding(true);
    addItem(product);
    addToast(`${product.name} added to cart!`, 'success');
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <article className={`product-card${adding ? ' adding' : ''}`} aria-label={`${product.name}, $${product.price}`}>
      <div className="product-emoji-wrap" aria-hidden="true">
        <span className="product-emoji">{product.emoji}</span>
        {product.badge && <span className="product-badge">{product.badge}</span>}
        {inCart && <span className="in-cart-chip" aria-label={`${inCart.qty} in cart`}>🛒 {inCart.qty}</span>}
      </div>
      <div className="product-info">
        <p className="product-weight">{product.weight}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating" aria-label={`Rated ${product.rating} out of 5, ${product.reviews} reviews`}>
          <span className="stars" aria-hidden="true">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
          <span className="rating-count">({product.reviews})</span>
        </div>
        <div className="product-footer">
          <span className="product-price" aria-label={`Price $${product.price}`}>${product.price.toFixed(2)}</span>
          <button
            className="add-btn"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
