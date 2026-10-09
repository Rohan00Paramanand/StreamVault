import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  SkipBack,
  SkipForward,
  X,
  Heart,
  Repeat,
  Tv,
  Check,
  ShieldCheck
} from 'lucide-react';
import { formatDuration } from '../utils/videoMetadataHelper';

export default function CustomVideoPlayer({
  video,
  onClose,
  onToggleFavorite,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onDurationResolved
}) {
  const videoRef = useRef(null);
  const playerStageRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // Seek handler
  const handleScrubberClick = (e) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Skip time (+10s, -10s)
  const skipTime = (delta) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
  };

  // Volume Change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  // Mute / Unmute
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && volume === 0) {
      setVolume(0.5);
      videoRef.current.volume = 0.5;
    }
  };

  // Speed Change
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Toggle Loop
  const toggleLoop = () => {
    const nextLoop = !isLooping;
    setIsLooping(nextLoop);
    if (videoRef.current) {
      videoRef.current.loop = nextLoop;
    }
  };

  // Picture in Picture
  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported or failed', err);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!playerStageRef.current) return;
    if (!document.fullscreenElement) {
      playerStageRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Auto-hide controls during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if typing in input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTime(-5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTime(5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.min(1, v + 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((v) => {
            const next = Math.max(0, v - 0.1);
            if (videoRef.current) videoRef.current.volume = next;
            return next;
          });
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (!document.fullscreenElement) {
            onClose();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, duration, isMuted, volume]);

  // Video Event Handlers
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);

    // Buffer calculation
    if (videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      if (duration > 0) {
        setBuffered((bufferedEnd / duration) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const realDuration = videoRef.current.duration;
      setDuration(realDuration);
      if (onDurationResolved && !isNaN(realDuration) && realDuration > 0) {
        onDurationResolved(video.id, formatDuration(realDuration), Math.round(realDuration));
      }
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="player-modal-backdrop" onClick={onClose}>
      <div className="player-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="player-header">
          <div className="player-header-title">
            <span className="category-tag" style={{ position: 'static' }}>{video.category}</span>
            <span>{video.title}</span>
          </div>
          <button className="player-close-btn" onClick={onClose} title="Close Player (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Video Stage & Custom Controls */}
        <div
          ref={playerStageRef}
          className="video-stage"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="main-video-element"
            onClick={togglePlay}
            onPlay={() => {
              setIsPlaying(true);
              setHasError(false);
            }}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              handleLoadedMetadata();
              setHasError(false);
            }}
            onError={() => {
              setHasError(true);
              setIsPlaying(false);
            }}
            onEnded={() => setIsPlaying(false)}
            playsInline
          />

          {/* Error Message Overlay */}
          {hasError && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.92)',
              padding: '24px',
              textAlign: 'center',
              zIndex: 10
            }}>
              <p style={{ color: '#f87171', fontWeight: 700, fontSize: '1.1rem', marginBottom: '8px' }}>
                Video stream unavailable or restricted by browser/network
              </p>
              <p style={{ color: '#9ca3af', fontSize: '0.88rem', maxWidth: '420px', marginBottom: '16px' }}>
                You can try another video in the gallery or upload your own video files (MP4/WebM) using the Upload button!
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {hasNext && (
                  <button className="btn-secondary" onClick={onNext}>
                    Next Video →
                  </button>
                )}
                <button className="btn-primary" onClick={() => {
                  if (videoRef.current) {
                    setHasError(false);
                    videoRef.current.load();
                  }
                }}>
                  Retry Playback
                </button>
              </div>
            </div>
          )}

          {/* Big Center Play/Pause button on pause */}
          {!isPlaying && (
            <div className="center-play-indicator" onClick={togglePlay}>
              <Play size={32} fill="#ffffff" style={{ marginLeft: '4px' }} />
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div className={`player-controls-overlay ${!showControls ? 'controls-hidden' : ''}`}>
            {/* Top row (if in fullscreen) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {video.title}
              </span>
            </div>

            {/* Bottom Scrubber & Buttons */}
            <div className="bottom-controls-bar">
              {/* Progress Scrubber */}
              <div
                className="scrubber-container"
                onClick={handleScrubberClick}
                title="Seek position"
              >
                <div className="scrubber-buffer" style={{ width: `${buffered}%` }} />
                <div className="scrubber-progress" style={{ width: `${progressPercent}%` }}>
                  <div className="scrubber-thumb" />
                </div>
              </div>

              {/* Controls Action Row */}
              <div className="controls-row">
                <div className="controls-left">
                  {/* Previous Video in list */}
                  <button
                    className="ctrl-btn"
                    onClick={onPrev}
                    disabled={!hasPrev}
                    style={{ opacity: hasPrev ? 1 : 0.4 }}
                    title="Previous Video"
                  >
                    <SkipBack size={18} />
                  </button>

                  {/* Play / Pause */}
                  <button className="ctrl-btn" onClick={togglePlay} title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                    {isPlaying ? <Pause size={20} /> : <Play size={20} fill="#ffffff" />}
                  </button>

                  {/* Next Video in list */}
                  <button
                    className="ctrl-btn"
                    onClick={onNext}
                    disabled={!hasNext}
                    style={{ opacity: hasNext ? 1 : 0.4 }}
                    title="Next Video"
                  >
                    <SkipForward size={18} />
                  </button>

                  {/* Skip -10s */}
                  <button className="ctrl-btn" onClick={() => skipTime(-10)} title="Rewind 10s (←)">
                    <RotateCcw size={17} />
                  </button>

                  {/* Volume Control */}
                  <div className="volume-control-group">
                    <button className="ctrl-btn" onClick={toggleMute} title={isMuted ? 'Unmute (M)' : 'Mute (M)'}>
                      {isMuted || volume === 0 ? (
                        <VolumeX size={19} color="#ef4444" />
                      ) : volume < 0.5 ? (
                        <Volume1 size={19} />
                      ) : (
                        <Volume2 size={19} />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="volume-slider"
                      title="Volume (↑ / ↓)"
                    />
                  </div>

                  {/* Time Stamp Display */}
                  <span className="time-display">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="controls-right">
                  {/* Playback Speed */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                    className="speed-select"
                    title="Playback Speed"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1">1.0x (Normal)</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  {/* Loop Toggle */}
                  <button
                    className={`ctrl-btn ${isLooping ? 'active' : ''}`}
                    onClick={toggleLoop}
                    title={isLooping ? 'Looping enabled' : 'Enable loop'}
                  >
                    <Repeat size={18} />
                  </button>

                  {/* Picture-in-Picture */}
                  <button
                    className="ctrl-btn"
                    onClick={togglePictureInPicture}
                    title="Picture in Picture"
                  >
                    <Tv size={18} />
                  </button>

                  {/* Fullscreen */}
                  <button
                    className="ctrl-btn"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Info / Details section below player */}
        <div className="player-details">
          <div className="details-title-row">
            <div>
              <h2 className="details-title">{video.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                <span>Uploaded by <strong style={{ color: '#c7d2fe' }}>{video.uploader || 'Local User'}</strong></span>
                <span>•</span>
                <span>{video.views} views</span>
                <span>•</span>
                <span>{video.uploadedAt}</span>
                {video.safetyStatus && (
                  <>
                    <span>•</span>
                    <span className="player-safety-badge" title="Content Verified Safe by Moderation AI">
                      <ShieldCheck size={14} color="#34d399" />
                      <span>Verified Safe</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="details-actions">
              <button
                className={`btn-secondary ${video.isFavorite ? 'fav-active' : ''}`}
                onClick={() => onToggleFavorite(video.id)}
              >
                <Heart size={16} fill={video.isFavorite ? '#ec4899' : 'none'} />
                <span>{video.isFavorite ? 'Favorited' : 'Favorite'}</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="details-tags">
              {video.tags.map((tag) => (
                <span key={tag} className="tag-badge">#{tag}</span>
              ))}
            </div>
          )}

          {/* Description */}
          <p className="details-description">
            {video.description || 'No detailed description available for this video.'}
          </p>
        </div>
      </div>
    </div>
  );
}
