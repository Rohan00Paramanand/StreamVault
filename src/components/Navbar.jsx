import React from 'react';
import { Play, Search, Plus, Film, X } from 'lucide-react';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  onOpenUpload,
  totalVideos,
  onResetFilters
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

        {/* Actions */}
        <div className="nav-actions">
          <div className="stats-pill" title="Total videos in library">
            <Film size={14} className="stats-icon" />
            <span><strong className="stats-count">{totalVideos}</strong> items</span>
          </div>

          <button
            className="btn-upload-primary"
            onClick={onOpenUpload}
            title="Upload new video"
            type="button"
          >
            <Plus size={16} />
            <span>Upload</span>
          </button>
        </div>
      </div>
    </header>
  );
}
