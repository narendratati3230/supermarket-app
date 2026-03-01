import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories, getFeaturedProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const featured = getFeaturedProducts();

  return (
    <main className="home-page" id="main-content">

      {/* Hero */}
      <section className="hero" aria-label="Welcome to FreshMart">
        <div className="container hero-inner">
          <div className="hero-text animate-fadeInUp">
            <span className="hero-tag">🌿 Fresh & Organic</span>
            <h1>Fresh Groceries<br/><em>Delivered Fast</em></h1>
            <p>Shop from over 200 fresh products. From farm to your table in hours. Quality guaranteed.</p>
            <div className="hero-ctas">
              <Link to="/shop" className="btn-primary">Shop Now →</Link>
              <Link to="/shop?cat=fruits" className="btn-secondary">Browse Fresh Produce</Link>
            </div>
            <div className="hero-stats" aria-label="Store statistics">
              <div><strong>200+</strong><span>Products</span></div>
              <div><strong>4.9★</strong><span>Rating</span></div>
              <div><strong>FREE</strong><span>Delivery</span></div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-circles">
              {['🍓','🥑','🥛','🥕','🍞','🍊'].map((e, i) => (
                <span key={i} className={`floating-emoji emoji-${i}`} style={{ animationDelay: `${i * 0.3}s` }}>{e}</span>
              ))}
              <div className="hero-main-emoji">🛒</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section" aria-labelledby="categories-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="categories-heading">Shop by Category</h2>
            <Link to="/shop">View all →</Link>
          </div>
          <div className="categories-grid" role="list">
            {categories.slice(1).map(cat => (
              <button
                key={cat.id}
                className="category-chip"
                onClick={() => navigate(`/shop?cat=${cat.id}`)}
                role="listitem"
                aria-label={`Browse ${cat.name}`}
              >
                <span aria-hidden="true">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner" aria-label="Promotion">
        <div className="container promo-inner">
          <div className="promo-text">
            <span className="promo-tag">LIMITED TIME</span>
            <h2>Free Delivery on All Orders!</h2>
            <p>No minimum spend. Fresh products delivered to your door, always free.</p>
            <Link to="/shop" className="btn-promo">Start Shopping</Link>
          </div>
          <div className="promo-visual" aria-hidden="true">
            🚚✨
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section" aria-labelledby="featured-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="featured-heading">Customer Favourites</h2>
            <Link to="/shop">See all products →</Link>
          </div>
          <div className="products-grid">
            {featured.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="trust-section" aria-labelledby="trust-heading">
        <div className="container">
          <h2 id="trust-heading" className="sr-only">Why choose FreshMart</h2>
          <div className="trust-grid">
            {[
              { icon: '🌱', title: 'Always Fresh', desc: 'Products sourced daily from local farms and trusted suppliers.' },
              { icon: '🚚', title: 'Fast Delivery', desc: 'Get your groceries delivered within 2 hours of ordering.' },
              { icon: '🔒', title: 'Secure Payments', desc: 'Your payment is protected with bank-grade encryption.' },
              { icon: '↩️', title: 'Easy Returns', desc: "Not satisfied? We'll refund or replace, no questions asked." },
            ].map(t => (
              <div key={t.title} className="trust-card">
                <span className="trust-icon" aria-hidden="true">{t.icon}</span>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
