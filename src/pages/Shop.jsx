import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories, products } from '../data/products';
import ProductCard from '../components/ProductCard';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('cat') || 'all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState('default');
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const cat = searchParams.get('cat');
    const search = searchParams.get('search');
    if (cat) setActiveCategory(cat);
    if (search) { setSearchQuery(search); setLocalSearch(search); }
  }, [searchParams]);

  const filtered = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (sortBy === 'price-asc') result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result = [...result].sort((a, b) => b.rating - a.rating);
    if (sortBy === 'name') result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [activeCategory, searchQuery, sortBy]);

  const handleCatChange = (id) => {
    setActiveCategory(id);
    setSearchQuery('');
    setLocalSearch('');
    if (id === 'all') setSearchParams({});
    else setSearchParams({ cat: id });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (localSearch) { setActiveCategory('all'); setSearchParams({ search: localSearch }); }
    else setSearchParams({});
  };

  return (
    <main id="main-content" className="shop-page">
      <div className="container">
        <div className="shop-header">
          <div>
            <h1>Our Products</h1>
            <p aria-live="polite">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
          </div>
          <div className="shop-controls">
            <form onSubmit={handleSearch} className="shop-search" role="search">
              <label htmlFor="shop-search" className="sr-only">Search products</label>
              <input
                id="shop-search"
                type="search"
                placeholder="Search..."
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
              />
              <button type="submit" aria-label="Search">🔍</button>
            </form>
            <div className="sort-wrap">
              <label htmlFor="sort-select" className="sr-only">Sort products</label>
              <select id="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Default Order</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">A → Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="shop-layout">
          {/* Category sidebar */}
          <aside className="shop-sidebar" aria-label="Product categories">
            <h2>Categories</h2>
            <nav>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-btn${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCatChange(cat.id)}
                  aria-pressed={activeCategory === cat.id}
                  aria-label={`Filter by ${cat.name}`}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Products grid */}
          <section aria-label="Products">
            {/* Mobile categories scroll */}
            <div className="mobile-cats" role="list" aria-label="Product categories">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`mobile-cat-chip${activeCategory === cat.id ? ' active' : ''}`}
                  onClick={() => handleCatChange(cat.id)}
                  role="listitem"
                  data-active={activeCategory === cat.id}
                >
                  <span aria-hidden="true">{cat.icon}</span> {cat.name}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="no-results" aria-live="polite">
                <span aria-hidden="true">🔍</span>
                <h3>No products found</h3>
                <p>Try a different category or search term.</p>
                <button onClick={() => { setActiveCategory('all'); setSearchQuery(''); setLocalSearch(''); setSearchParams({}); }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="products-grid" aria-live="polite">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}