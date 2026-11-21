import React, { useState } from 'react';
import { api } from '../api/api';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('ADMIN'); // 'ADMIN' or 'USER'
  const [loading, setLoading] = useState(false);

  // Default credentials ready to test immediately
  const [name, setName] = useState('Warehouse Administrator');
  const [email, setEmail] = useState('admin@stockpilot.ai');
  const [password, setPassword] = useState('Admin@12345');

  if (!isOpen) return null;

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (isLogin) {
      if (role === 'ADMIN') {
        setEmail('admin@stockpilot.ai');
        setPassword('Admin@12345');
        setName('Warehouse Administrator');
      } else {
        setEmail('staff@stockpilot.ai');
        setPassword('Staff@12345');
        setName('Floor Operator');
      }
    }
  };

  const handleDirectQuickLogin = async (role) => {
    setLoading(true);
    const targetEmail = role === 'ADMIN' ? 'admin@stockpilot.ai' : 'staff@stockpilot.ai';
    const targetPassword = role === 'ADMIN' ? 'Admin@12345' : 'Staff@12345';
    try {
      const res = await api.login(targetEmail, targetPassword);
      const roleLabel = res.role === 'ADMIN' ? 'Administrator' : 'Warehouse Staff';
      showToast(`Logged in successfully as ${res.name || 'User'} (${roleLabel})!`, 'success');
      onAuthSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Login failed. Please check backend connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your work email and password', 'error');
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
        const roleLabel = res.role === 'ADMIN' ? 'Administrator' : 'Warehouse Staff';
        showToast(`Welcome back, ${res.name || 'User'} (${roleLabel})!`, 'success');
        onAuthSuccess();
        onClose();
      } else {
        const regEmail = email.trim();
        await api.register(name.trim(), regEmail, password, selectedRole);
        showToast('Account created successfully! Signing in...', 'success');
        
        // Immediate seamless sign in
        await api.login(regEmail, password);
        onAuthSuccess();
        onClose();
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose}>
      <div className="auth-modal-card-animated" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close-minimal" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="auth-header-minimal">
          <div className="auth-brand-badge">
            <span className="brand-dot"></span>
            <span>StockPilot AI</span>
          </div>
          <h2 className="auth-title-clean">
            {isLogin ? 'Sign In to Workspace' : 'Create an Account'}
          </h2>
          <p className="auth-sub-clean">
            {selectedRole === 'ADMIN' ? 'Executive inventory management, procurement & financial analytics' : 'Floor stock search, barcode lookups & movement requests'}
          </p>
        </div>

        {/* Clean Role Selection Tabs */}
        <div className="auth-role-tabs-clean">
          <button 
            type="button"
            className={`role-tab-clean ${selectedRole === 'ADMIN' ? 'active-admin' : ''}`}
            onClick={() => handleRoleSelect('ADMIN')}
          >
            <span className="role-tab-title">Administrator</span>
            <span className="role-tab-caption">Full Management & POs</span>
          </button>

          <button 
            type="button"
            className={`role-tab-clean ${selectedRole === 'USER' ? 'active-user' : ''}`}
            onClick={() => handleRoleSelect('USER')}
          >
            <span className="role-tab-title">Warehouse Staff</span>
            <span className="role-tab-caption">Stock Catalog & Lookups</span>
          </button>
        </div>

        {/* Mode Switch (Sign In / Create Account) */}
        <div className="auth-mode-switch-clean">
          <button 
            type="button"
            className={`mode-btn ${isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(true);
              handleRoleSelect(selectedRole);
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`mode-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => {
              setIsLogin(false);
              setName('');
              setPassword('');
            }}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form-clean">
          {!isLogin && (
            <div className="form-group-clean">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className="input-field-animated"
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group-clean">
            <label htmlFor="auth-email">Work Email</label>
            <input
              id="auth-email"
              type="email"
              className="input-field-animated"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group-clean">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="input-field-animated"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-auth-animated-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner"></span>
            ) : (
              isLogin ? `Sign In as ${selectedRole === 'ADMIN' ? 'Administrator' : 'Warehouse Staff'}` : `Register ${selectedRole === 'ADMIN' ? 'Administrator' : 'Staff'} Account`
            )}
          </button>
        </form>

        {/* Direct One-Click Instant Login options */}
        <div className="auth-quick-creds-clean">
          <span className="quick-creds-title">Instant One-Click Login:</span>
          <div className="quick-creds-row">
            <button 
              type="button" 
              className="demo-pill-clean admin-pill"
              disabled={loading}
              onClick={() => handleDirectQuickLogin('ADMIN')}
              title="admin@stockpilot.ai / Admin@12345"
            >
              ⚡ Quick Login: Administrator
            </button>
            <button 
              type="button" 
              className="demo-pill-clean staff-pill"
              disabled={loading}
              onClick={() => handleDirectQuickLogin('USER')}
              title="staff@stockpilot.ai / Staff@12345"
            >
              ⚡ Quick Login: Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
