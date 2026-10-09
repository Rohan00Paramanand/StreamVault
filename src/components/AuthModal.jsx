import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, onSignup }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (activeTab === 'login') {
      const result = onLogin(email, password);
      if (!result.success) {
        setErrorMsg(result.error || 'Authentication failed.');
      } else {
        handleClose();
      }
    } else {
      const result = onSignup(name, email, password);
      if (!result.success) {
        setErrorMsg(result.error || 'Registration failed.');
      } else {
        handleClose();
      }
    }
  };

  const fillAdminCredentials = () => {
    setActiveTab('login');
    setEmail('admin@streamvault.com');
    setPassword('admin123');
    setErrorMsg('');
  };

  const fillViewerCredentials = () => {
    setActiveTab('login');
    setEmail('viewer@streamvault.com');
    setPassword('viewer123');
    setErrorMsg('');
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="upload-modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h3>
            <Lock size={18} color="#3b82f6" />
            <span>{activeTab === 'login' ? 'Account Sign In' : 'Create Free Account'}</span>
          </h3>
          <button className="player-close-btn" onClick={handleClose} title="Close" type="button">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Switcher */}
          <div className="modal-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg('');
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Quick Demo Credential Pills */}
          <div style={{ marginBottom: '16px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Quick Fill Demo Accounts (For Viva / Testing):
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={fillAdminCredentials}
                className="btn-secondary"
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                title="Only Admin can upload and delete"
              >
                👑 Fill Admin
              </button>
              <button
                type="button"
                onClick={fillViewerCredentials}
                className="btn-secondary"
                style={{ fontSize: '0.74rem', padding: '4px 10px' }}
                title="Viewers can only watch and favorite"
              >
                👀 Fill Viewer
              </button>
            </div>
          </div>

          {errorMsg && (
            <div style={{ padding: '8px 12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: 'var(--radius-sm)', color: '#fda4af', fontSize: '0.82rem', marginBottom: '14px' }}>
              {errorMsg}
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="search-input-wrapper" style={{ padding: '0 12px' }}>
                <User size={15} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="search-input-wrapper" style={{ padding: '0 12px' }}>
              <Mail size={15} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="search-input-wrapper" style={{ padding: '0 12px' }}>
              <Lock size={15} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="search-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="clear-search-btn"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '16px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <span>{activeTab === 'login' ? 'Sign In' : 'Create Account'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
