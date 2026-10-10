import React from 'react';
import { Play, Heart, Trash2, ShieldCheck } from 'lucide-react';
import { getCategoryPoster } from '../utils/thumbnailGenerator';

export default function VideoCard({
  video,
  onPlay,
  onToggleFavorite,
  onDelete
}) {
  const {
    id,
    title,
    description,
    category,
    duration,
    thumbnailUrl,
    views,
    uploadedAt,
    isFavorite,
    uploader,
    isCustomUpload,
    safetyStatus
  } = video;

  const fallbackThumbnail = getCategoryPoster(title || 'Video', category || 'General');

  return (
    <article className="video-card">
      {/* Thumbnail & Hover Play */}
      <div className="video-thumbnail-wrapper" onClick={() => onPlay(video)}>
        <img
          src={thumbnailUrl || fallbackThumbnail}
          alt={title}
          className="video-thumbnail"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackThumbnail;
          }}
        />
        
        {/* Play Overlay */}
        <div className="play-overlay-btn" title="Click to play">
          <div className="play-circle">
            <Play size={20} fill="#ffffff" style={{ marginLeft: '2px' }} />
          </div>
        </div>

        {/* Category Badge */}
        <span className="category-tag">{category}</span>

        {/* Badges on right side */}
        <div className="thumbnail-badges-right">
          {safetyStatus && (
            <span className="safety-badge" title="Content Verified Safe by Moderation AI">
              <ShieldCheck size={11} color="#34d399" />
              <span>Safe</span>
            </span>
          )}
          {isCustomUpload && <span className="custom-upload-badge">Uploaded</span>}
        </div>

        {/* Duration Badge */}
        <span className="duration-badge">{duration || '00:00'}</span>
      </div>

      {/* Card Details */}
      <div className="video-card-body">
        <h3
          className="video-card-title"
          onClick={() => onPlay(video)}
          title={title}
        >
          {title}
        </h3>

        <p className="video-card-desc">
          {description || 'No description provided.'}
        </p>

        <div className="video-card-meta">
          <div className="meta-info">
            <span className="meta-uploader">{uploader || 'Local User'}</span>
            <div className="meta-stats">
              <span>{views} views</span>
              <span className="meta-dot">•</span>
              <span>{uploadedAt}</span>
            </div>
          </div>

          <div className="meta-actions">
            {/* Favorite Button */}
            <button
              type="button"
              className={`icon-action-btn ${isFavorite ? 'favorite-active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(id);
              }}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              className="icon-action-btn delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Are you sure you want to remove "${title}"?`)) {
                  onDelete(id);
                }
              }}
              title="Delete video"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
