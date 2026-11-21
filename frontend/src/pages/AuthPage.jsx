import React, { useState } from 'react';
import { api } from '../api/api';
import { Icon } from '../components/Icons';

export const AuthPage = ({ onAuthSuccess, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in email and password', 'error');
      return;
    }
    if (!isLogin && !name.trim()) {
      showToast('Please enter your full name', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const res = await api.login(email.trim(), password);
        showToast(`Welcome back, ${res.name || 'Manager'}!`, 'success');
        onAuthSuccess();
      } else {
        await api.register(name.trim(), email.trim(), password);
        showToast('Registration successful! Logging you in...', 'success');
        // Auto-login right after registration since OTP is removed!
        const res = await api.login(email.trim(), password);
        onAuthSuccess();
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCredentials = () => {
    setEmail('admin@stockpilot.com');
    setPassword('Admin123!');
    setName('Demo Admin');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon-pulse">
              <Icon name="box" size={28} color="#38bdf8" />
            </div>
            <div className="brand-title">
              <h1>StockPilot <span className="highlight-ai">AI</span></h1>
              <p className="brand-tagline">Intelligent Inventory & Supply Chain Platform</p>
            </div>
          </div>
        </div>

        <div className="auth-tab-switch">
          <button 
            type="button"
            className={`tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-with-icon">
                <span className="input-icon"><Icon name="user" size={17} /></span>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <div className="input-with-icon">
              <span className="input-icon">@</span>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
              />
            </div>
          </div>

          {!isLogin && (
            <div className="otp-info-pill">
              <Icon name="checkCircle" size={14} color="#10b981" />
              <span>Instant activation enabled &bull; No email verification required</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner"></span>
            ) : (
              <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button 
            type="button" 
            className="btn-demo-fill"
            onClick={handleDemoCredentials}
          >
            ⚡ Fill Demo Credentials
          </button>
        </div>
      </div>
    </div>
  );
};
