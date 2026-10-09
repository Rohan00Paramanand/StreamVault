import React from 'react';
import { Film, Heart, CloudUpload } from 'lucide-react';

export default function HeroBanner({ totalVideos, totalFavorites, customUploadsCount }) {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Video Library</h1>
          <p className="hero-subtitle">
            Curated media collection featuring custom playback controls, categorisation, and local uploads.
          </p>
        </div>

        <div className="hero-metrics">
          <div className="metric-item">
            <span className="metric-number">{totalVideos}</span>
            <span className="metric-label">Videos</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <span className="metric-number">{totalFavorites}</span>
            <span className="metric-label">Favorites</span>
          </div>
          <div className="metric-divider" />
          <div className="metric-item">
            <span className="metric-number">{customUploadsCount}</span>
            <span className="metric-label">Uploaded</span>
          </div>
        </div>
      </div>
    </section>
  );
}
