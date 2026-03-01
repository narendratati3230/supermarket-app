import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToastMsg } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToastMsg();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email address';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      addToast('Welcome back!', 'success');
      navigate(from, { replace: true });
    } else {
      setErrors({ general: result.error });
    }
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const fillDemo = () => {
    setForm({ email: 'demo@freshmart.com', password: 'demo123' });
  };

  return (
    <main id="main-content" className="auth-page">
      <div className="auth-split">
        <div className="auth-visual" aria-hidden="true">
          <div className="auth-visual-inner">
            <span className="auth-big-emoji">🛒</span>
            <h2>Welcome Back!</h2>
            <p>Sign in to continue shopping with FreshMart and access your orders.</p>
            <div className="auth-features">
              <div>✓ Track your orders</div>
              <div>✓ Save your favourites</div>
              <div>✓ Fast checkout</div>
            </div>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-card">
            <div className="auth-brand">
              <Link to="/" aria-label="FreshMart Home">🛒 Fresh<strong>Mart</strong></Link>
            </div>

            <h1>Sign In</h1>
            <p className="auth-subtitle">Don't have an account? <Link to="/register">Create one</Link></p>

            {errors.general && (
              <div className="auth-error-banner" role="alert" aria-live="assertive">
                <span>⚠</span> {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className={`form-group${errors.email ? ' has-error' : ''}`}>
                <label htmlFor="email">Email Address</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && <span id="email-error" className="field-error" role="alert">{errors.email}</span>}
              </div>

              <div className={`form-group${errors.password ? ' has-error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <span className="input-icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
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
                {errors.password && <span id="password-error" className="field-error" role="alert">{errors.password}</span>}
              </div>

              <button type="submit" className="btn-auth" disabled={loading} aria-busy={loading}>
                {loading ? <span className="spinner" aria-hidden="true"/> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-divider"><span>or</span></div>

            <button className="btn-demo" onClick={fillDemo} type="button">
              Try Demo Account
            </button>

            <p className="auth-note">
              By signing in you agree to our <a href="#terms">Terms</a> & <a href="#privacy">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}