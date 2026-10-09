import React from 'react';
import { Play, Search, Plus, Film, X, User, LogIn, LogOut, Shield } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  totalVideos,
  onResetFilters,
  currentUser,
  isAdmin,
  onOpenAuth,
  onLogout
}) {
  return (
    <header className="navbar">
      <div className="navbar-content">
        {/* Brand / Logo */}
        <div className="brand-logo" onClick={onResetFilters} role="button" tabIndex={0} title="StreamVault Home">
          <div className="logo-icon">
            <Play size={16} fill="#ffffff" />
          </div>
          <div className="brand-titles">
            <span className="brand-name">StreamVault</span>
          </div>
        </div>

        {/* Global Search Input */}
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, tag, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
                type="button"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Actions & RBAC Navigation */}
        <div className="nav-actions">
          <div className="stats-pill" title="Total videos in library">
            <Film size={14} className="stats-icon" />
            <span><strong className="stats-count">{totalVideos}</strong> items</span>
          </div>

          {/* Admin-Only Upload Button */}
          {isAdmin ? (
            <button
              className="btn-upload-primary"
              onClick={onOpenUpload}
              title="Upload new video (Admin Privilege)"
              type="button"
            >
              <Plus size={16} />
              <span>Upload</span>
            </button>
          ) : (
            <button
              className="btn-secondary"
              onClick={() => onOpenAuth('admin-prompt')}
              style={{ padding: '7px 12px', fontSize: '0.82rem' }}
              title="Administrator login required to upload videos"
              type="button"
            >
              <Shield size={14} color="#60a5fa" />
              <span>Admin Access</span>
            </button>
          )}

          {/* User Account / Session Controls */}
          {currentUser ? (
            <div className="user-profile-widget">
              <div className="user-avatar-badge" title={`${currentUser.name} (${currentUser.role})`}>
                <span className="user-initials">
                  {currentUser.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
                </span>
                <span className={`user-role-tag ${currentUser.role === 'admin' ? 'role-admin' : 'role-viewer'}`}>
                  {currentUser.role === 'admin' ? 'Admin' : 'Viewer'}
                </span>
              </div>
              <button
                type="button"
                className="icon-action-btn"
                onClick={onLogout}
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onOpenAuth('login')}
              style={{ padding: '7px 14px', fontSize: '0.84rem' }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
