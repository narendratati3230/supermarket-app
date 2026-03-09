import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const STATUS_COLORS = {
  Processing: { color: '#d97706', bg: '#fef3c7' },
  Confirmed:  { color: '#2563eb', bg: '#dbeafe' },
  Shipped:    { color: '#7c3aed', bg: '#ede9fe' },
  Delivered:  { color: '#16a34a', bg: '#dcfce7' },
  Cancelled:  { color: '#dc2626', bg: '#fee2e2' },
};

function safeTotal(order) {
  // Use saved total if valid, otherwise recalculate from items
  if (order.total && typeof order.total === 'number' && order.total > 0) {
    return order.total;
  }
  const subtotal = (order.items || []).reduce((s, i) => s + i.price * i.qty, 0);
  return subtotal + subtotal * 0.08;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const loadOrders = useCallback(() => {
    const allOrders = JSON.parse(localStorage.getItem('freshmart_orders') || '[]');
    const userOrders = user ? allOrders.filter(o => o.userId === user.id) : [];
    setOrders(userOrders);
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleCancelOrder = (orderId) => {
    setConfirmCancel(orderId);
  };

  const confirmCancelOrder = (orderId) => {
    setCancellingId(orderId);
    setTimeout(() => {
      const allOrders = JSON.parse(localStorage.getItem('freshmart_orders') || '[]');
      const updated = allOrders.map(o =>
        o.id === orderId ? { ...o, status: 'Cancelled', cancelledAt: new Date().toISOString() } : o
      );
      localStorage.setItem('freshmart_orders', JSON.stringify(updated));
      loadOrders();
      setCancellingId(null);
      setConfirmCancel(null);
    }, 800);
  };

  const canCancel = (status) => status === 'Processing' || status === 'Confirmed';

  if (!user) return (
    <main id="main-content" className="orders-page">
      <div className="container empty-state">
        <span aria-hidden="true">🔒</span>
        <h2>Please sign in</h2>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    </main>
  );

  return (
    <main id="main-content" className="orders-page">
      {/* Cancel confirm modal */}
      {confirmCancel && (
        <div className="cancel-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <div className="cancel-modal">
            <span className="cancel-modal-icon" aria-hidden="true">⚠️</span>
            <h3 id="cancel-title">Cancel this order?</h3>
            <p>Order <strong>#{confirmCancel}</strong> will be cancelled. This cannot be undone.</p>
            <div className="cancel-modal-btns">
              <button
                className="btn-confirm-cancel"
                onClick={() => confirmCancelOrder(confirmCancel)}
                disabled={!!cancellingId}
              >
                {cancellingId ? <span className="spinner-sm" aria-hidden="true"/> : null}
                {cancellingId ? 'Cancelling...' : 'Yes, Cancel Order'}
              </button>
              <button className="btn-keep-order" onClick={() => setConfirmCancel(null)}>
                Keep Order
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        <div className="orders-header">
          <div>
            <h1>My Orders</h1>
            <p>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/shop" className="btn-continue-shopping">+ Continue Shopping</Link>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">📦</span>
            <h2>No orders yet</h2>
            <p>Start shopping to see your orders here.</p>
            <Link to="/shop" className="btn-primary">Browse Shop</Link>
          </div>
        ) : (
          <div className="orders-list" role="list">
            {orders.map(order => {
              const orderTotal = safeTotal(order);
              const statusStyle = STATUS_COLORS[order.status] || { color: '#6b7280', bg: '#f3f4f6' };
              const isExpanded = expanded === order.id;

              return (
                <article key={order.id} className={`order-card${order.status === 'Cancelled' ? ' cancelled' : ''}`} role="listitem">

                  {/* Header row */}
                  <div className="order-card-header" onClick={() => setExpanded(isExpanded ? null : order.id)}>
                    <div className="order-main-info">
                      <div>
                        <p className="order-id">#{order.id}</p>
                        <p className="order-date">
                          {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          {' · '}
                          {new Date(order.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="order-meta">
                        <span
                          className="order-status-badge"
                          style={{ color: statusStyle.color, background: statusStyle.bg }}
                          aria-label={`Order status: ${order.status}`}
                        >
                          {order.status === 'Processing' && '⏳ '}
                          {order.status === 'Confirmed' && '✓ '}
                          {order.status === 'Shipped' && '🚚 '}
                          {order.status === 'Delivered' && '✅ '}
                          {order.status === 'Cancelled' && '✕ '}
                          {order.status}
                        </span>
                        <span className="order-total-badge">${orderTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="order-items-preview" aria-hidden="true">
                      {order.items.slice(0, 5).map(i => <span key={i.id}>{i.emoji}</span>)}
                      {order.items.length > 5 && <span className="more-items">+{order.items.length - 5}</span>}
                    </div>

                    <button
                      className={`expand-btn${isExpanded ? ' open' : ''}`}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? 'Collapse order details' : 'Expand order details'}
                      onClick={e => { e.stopPropagation(); setExpanded(isExpanded ? null : order.id); }}
                    >▼</button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="order-details animate-fadeIn">
                      <div className="order-details-grid">

                        {/* Items */}
                        <div className="order-section">
                          <h3>Items Ordered</h3>
                          <div className="order-items-list">
                            {order.items.map(item => (
                              <div key={item.id} className="order-item">
                                <span className="order-item-emoji" aria-hidden="true">{item.emoji}</span>
                                <span className="order-item-name">{item.name}</span>
                                <span className="order-item-qty">×{item.qty}</span>
                                <span className="order-item-price">${(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Totals breakdown */}
                          <div className="order-totals-breakdown">
                            <div className="order-breakdown-row">
                              <span>Subtotal</span>
                              <span>${(order.subtotal ?? order.items.reduce((s,i) => s + i.price * i.qty, 0)).toFixed(2)}</span>
                            </div>
                            <div className="order-breakdown-row">
                              <span>Tax (8%)</span>
                              <span>${(order.tax ?? orderTotal - (order.subtotal ?? orderTotal / 1.08)).toFixed(2)}</span>
                            </div>
                            <div className="order-breakdown-row">
                              <span>Delivery</span>
                              <span className="free-tag">FREE</span>
                            </div>
                            <div className="order-breakdown-row total">
                              <span>Total Charged</span>
                              <strong>${orderTotal.toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Delivery + Payment info */}
                        <div className="order-section">
                          {order.delivery?.address && (
                            <div className="order-info-block">
                              <h3>Delivery Address</h3>
                              <p>{order.delivery.address}</p>
                              <p>{order.delivery.city}{order.delivery.postcode ? `, ${order.delivery.postcode}` : ''}</p>
                              {order.delivery.phone && <p>📞 {order.delivery.phone}</p>}
                              {order.delivery.note && <p className="delivery-note">📝 "{order.delivery.note}"</p>}
                            </div>
                          )}

                          {order.cardBrand && (
                            <div className="order-info-block">
                              <h3>Payment</h3>
                              <p>💳 {order.cardBrand} ending in {order.cardLast4}</p>
                            </div>
                          )}

                          {order.status === 'Cancelled' && order.cancelledAt && (
                            <div className="order-info-block cancelled-info">
                              <h3>Cancellation</h3>
                              <p>Cancelled on {new Date(order.cancelledAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                              <p className="refund-note">💰 Refund will be processed in 3–5 business days</p>
                            </div>
                          )}

                          {/* Cancel button */}
                          {canCancel(order.status) && (
                            <button
                              className="btn-cancel-order"
                              onClick={e => { e.stopPropagation(); handleCancelOrder(order.id); }}
                              aria-label={`Cancel order ${order.id}`}
                            >
                              ✕ Cancel Order
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}