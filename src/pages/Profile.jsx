import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastMsg } from '../context/ToastContext';
import './Profile.css';

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const { addToast } = useToastMsg();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '', city: user?.city || '' });

  if (!user) return (
    <main id="main-content" className="profile-page">
      <div className="container empty-state">
        <span>🔒</span>
        <h2>Please sign in</h2>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    </main>
  );

  const handleSave = () => {
    if (!form.name.trim()) { addToast('Name is required', 'error'); return; }
    updateProfile(form);
    setEditing(false);
    addToast('Profile updated!', 'success');
  };

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'default');
    navigate('/');
  };

  const orders = JSON.parse(localStorage.getItem('freshmart_orders') || '[]').filter(o => o.userId === user.id);

  return (
    <main id="main-content" className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <div className="profile-layout">
          <div className="profile-card">
            <div className="profile-avatar" aria-hidden="true">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <p className="profile-email">{user.email}</p>
            <p className="profile-joined">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>

            <div className="profile-stats" aria-label="Account statistics">
              <div>
                <strong>{orders.length}</strong>
                <span>Orders</span>
              </div>
              <div>
                <strong>${orders.reduce((s, o) => s + o.total, 0).toFixed(2)}</strong>
                <span>Total Spent</span>
              </div>
            </div>

            <button className="btn-logout-full" onClick={handleLogout}>Sign Out</button>
          </div>

          <div className="profile-details">
            <div className="profile-section">
              <div className="section-header">
                <h3>Personal Information</h3>
                {!editing && <button className="btn-edit" onClick={() => setEditing(true)}>Edit</button>}
              </div>

              {editing ? (
                <div className="edit-form">
                  <div className="form-row">
                    <label htmlFor="pf-name">Full Name</label>
                    <input id="pf-name" type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div className="form-row">
                    <label htmlFor="pf-phone">Phone</label>
                    <input id="pf-phone" type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="Your phone number" />
                  </div>
                  <div className="form-row">
                    <label htmlFor="pf-address">Address</label>
                    <input id="pf-address" type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Your street address" />
                  </div>
                  <div className="form-row">
                    <label htmlFor="pf-city">City</label>
                    <input id="pf-city" type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} placeholder="Your city" />
                  </div>
                  <div className="edit-actions">
                    <button className="btn-save" onClick={handleSave}>Save Changes</button>
                    <button className="btn-cancel" onClick={() => { setEditing(false); setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '', city: user.city || '' }); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="info-grid">
                  {[
                    { label: 'Full Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Phone', value: user.phone || 'Not provided' },
                    { label: 'Address', value: user.address ? `${user.address}, ${user.city || ''}` : 'Not provided' },
                  ].map(item => (
                    <div key={item.label} className="info-item">
                      <span className="info-label">{item.label}</span>
                      <span className="info-value">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="profile-section">
              <div className="section-header">
                <h3>Recent Orders</h3>
                <Link to="/orders">View all →</Link>
              </div>
              {orders.length === 0 ? (
                <p className="no-orders-msg">No orders yet. <Link to="/shop">Start shopping!</Link></p>
              ) : (
                <div className="recent-orders">
                  {orders.slice(0, 3).map(o => (
                    <div key={o.id} className="recent-order">
                      <div>
                        <p className="recent-order-id">#{o.id}</p>
                        <p className="recent-order-date">{new Date(o.date).toLocaleDateString()}</p>
                      </div>
                      <span className="recent-order-status">{o.status}</span>
                      <span className="recent-order-total">${o.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
