import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastMsg } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToastMsg();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = register({ name: form.name.trim(), email: form.email, password: form.password, phone: form.phone });
    setLoading(false);
    if (result.success) {
      addToast('Account created! Welcome to FreshMart!', 'success');
      navigate('/', { replace: true });
    } else {
      setErrors({ general: result.error });
    }
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const strength = !form.password ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#dc2626', '#f59e0b', '#16a34a'][strength];

  return (
    <main id="main-content" className="auth-page">
      <div className="auth-split">
        <div className="auth-visual register-visual" aria-hidden="true">
          <div className="auth-visual-inner">
            <span className="auth-big-emoji">🌿</span>
            <h2>Join FreshMart</h2>
            <p>Create your account and start enjoying fresh groceries delivered to your door.</p>
            <div className="auth-features">
              <div>✓ Free delivery on all orders</div>
              <div>✓ Fresh products every day</div>
              <div>✓ Secure payments</div>
              <div>✓ Easy order tracking</div>
            </div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-card">
            <div className="auth-brand">
              <Link to="/" aria-label="FreshMart Home">🛒 Fresh<strong>Mart</strong></Link>
            </div>

            <h1>Create Account</h1>
            <p className="auth-subtitle">Already have an account? <Link to="/login">Sign in</Link></p>

            {errors.general && (
              <div className="auth-error-banner" role="alert" aria-live="assertive">
                <span>⚠</span> {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className={`form-group${errors.name ? ' has-error' : ''}`}>
                <label htmlFor="name">Full Name</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    id="name" type="text" value={form.name} onChange={handleChange('name')}
                    placeholder="John Smith" autoComplete="name"
                    aria-describedby={errors.name ? 'name-error' : undefined} aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && <span id="name-error" className="field-error" role="alert">{errors.name}</span>}
              </div>

              <div className={`form-group${errors.email ? ' has-error' : ''}`}>
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    id="reg-email" type="email" value={form.email} onChange={handleChange('email')}
                    placeholder="you@example.com" autoComplete="email"
                    aria-describedby={errors.email ? 'reg-email-error' : undefined} aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && <span id="reg-email-error" className="field-error" role="alert">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone <span className="optional">(optional)</span></label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </span>
                  <input id="phone" type="tel" value={form.phone} onChange={handleChange('phone')} placeholder="+1 (555) 000-0000" autoComplete="tel" />
                </div>
              </div>

              <div className={`form-group${errors.password ? ' has-error' : ''}`}>
                <label htmlFor="reg-password">Password</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="reg-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange('password')}
                    placeholder="Min. 6 characters" autoComplete="new-password"
                    aria-describedby="pw-strength" aria-invalid={!!errors.password}
                  />
                  <button type="button" className="toggle-pw" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {form.password && (
                  <div id="pw-strength" className="pw-strength" aria-live="polite">
                    <div className="pw-bars">
                      {[1,2,3].map(i => (
                        <div key={i} className="pw-bar" style={{ background: i <= strength ? strengthColor : 'var(--gray-200)' }} />
                      ))}
                    </div>
                    <span style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                )}
                {errors.password && <span className="field-error" role="alert">{errors.password}</span>}
              </div>

              <div className={`form-group${errors.confirm ? ' has-error' : ''}`}>
                <label htmlFor="confirm">Confirm Password</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="confirm" type="password" value={form.confirm} onChange={handleChange('confirm')}
                    placeholder="Repeat password" autoComplete="new-password"
                    aria-describedby={errors.confirm ? 'confirm-error' : undefined} aria-invalid={!!errors.confirm}
                  />
                </div>
                {errors.confirm && <span id="confirm-error" className="field-error" role="alert">{errors.confirm}</span>}
              </div>

              <button type="submit" className="btn-auth" disabled={loading} aria-busy={loading}>
                {loading && <span className="spinner" aria-hidden="true"/>}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-note">
              By creating an account you agree to our <a href="#terms">Terms</a> & <a href="#privacy">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}