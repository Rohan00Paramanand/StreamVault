import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  Film,
  Plus,
  Trash2,
  ShieldAlert,
  Loader2,
  Check,
  Image as ImageIcon
} from 'lucide-react';
import { CATEGORIES } from '../data/initialVideos';
import { useContentModeration } from '../hooks/useContentModeration';
import { inspectVideoAndGenerateThumbnails } from '../utils/videoMetadataHelper';

export default function VideoUploadModal({ isOpen, onClose, onAddVideos }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('files'); // 'files' | 'url'
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Form metadata fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [customThumbnailUrl, setCustomThumbnailUrl] = useState('');
  const [simulateFlag, setSimulateFlag] = useState(false);

  // Dynamic Video Analysis & YouTube-style Thumbnail States
  const [candidateThumbnails, setCandidateThumbnails] = useState([]);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(1);
  const [extractedDuration, setExtractedDuration] = useState('');
  const [extractedDurationSeconds, setExtractedDurationSeconds] = useState(0);
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false);

  // Content moderation hook
  const {
    isScanning,
    scanProgress,
    statusMessage,
    runModeration,
    resetModeration
  } = useContentModeration();

  const [violationAlert, setViolationAlert] = useState(null);

  // Inspect video to extract exact duration and candidate keyframes
  const analyzeVideoSource = async (videoSource) => {
    setIsAnalyzingVideo(true);
    try {
      const meta = await inspectVideoAndGenerateThumbnails(videoSource, 3);
      setExtractedDuration(meta.duration);
      setExtractedDurationSeconds(meta.durationSeconds);
      setCandidateThumbnails(meta.frames);

      // Default to the middle frame (Frame 2), like YouTube!
      if (meta.frames.length >= 2) {
        setSelectedThumbnailIndex(1);
      } else if (meta.frames.length > 0) {
        setSelectedThumbnailIndex(0);
      }
    } catch (err) {
      console.warn('Could not automatically inspect video frames:', err);
    } finally {
      setIsAnalyzingVideo(false);
    }
  };

  // Handle local files selected
  const handleFileSelection = (filesList) => {
    setViolationAlert(null);
    resetModeration();

    const validVideoFiles = Array.from(filesList).filter((file) =>
      file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mov|mkv)$/i)
    );

    if (validVideoFiles.length === 0) {
      alert('Please select valid video files (e.g. MP4, WebM, OGG, MOV).');
      return;
    }

    const processed = validVideoFiles.map((file) => {
      const blobUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      return {
        id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        file,
        name: cleanName,
        sizeMb: (file.size / (1024 * 1024)).toFixed(2),
        blobUrl
      };
    });

    setSelectedFiles((prev) => [...prev, ...processed]);

    if (processed.length === 1 && !title) {
      setTitle(processed[0].name);
    }

    // Automatically inspect video to extract real length and 3 candidate thumbnails
    if (processed.length > 0) {
      analyzeVideoSource(processed[0].file);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  // Remove queued file
  const removeQueuedFile = (id) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      if (next.length === 0) {
        setCandidateThumbnails([]);
        setExtractedDuration('');
        setExtractedDurationSeconds(0);
      }
      return next;
    });
  };

  // Handle URL change & blur to trigger candidate frame inspection
  const handleUrlBlur = () => {
    if (videoUrlInput && videoUrlInput.startsWith('http')) {
      analyzeVideoSource(videoUrlInput);
    }
  };

  // Submission handler with Content Safety Verification & Dynamic Metadata
  const handleSubmit = async (e) => {
    e.preventDefault();
    setViolationAlert(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const now = new Date().toISOString().split('T')[0];

    // Determine target video source for safety inspection
    const targetSource = activeTab === 'files'
      ? selectedFiles[0]?.file
      : videoUrlInput;

    if (activeTab === 'files' && selectedFiles.length === 0) {
      alert('Please select or drag at least one video file.');
      return;
    }
    if (activeTab === 'url' && !videoUrlInput) {
      alert('Please provide a valid video URL.');
      return;
    }

    if (simulateFlag) {
      // Demonstration Mode: Trigger live rejection without needing actual harmful files
      setViolationAlert({
        category: 'Prohibited Content: Extreme Violence & Gore',
        reason: 'Automated inspection detected prohibited violence and graphic content (AI Confidence: 94%). Upload blocked per platform trust & safety guidelines.',
      });
      return;
    }

    // Run Asynchronous Safety Moderation Pipeline (API / Keyframe Inspection)
    const inspection = await runModeration(targetSource, {
      title: title || (selectedFiles[0] ? selectedFiles[0].name : 'External Video'),
      description,
      tags
    });

    if (!inspection.isApproved) {
      // Content Flagged - Halt Upload
      setViolationAlert({
        category: inspection.flaggedCategory || 'Safety Violation',
        reason: inspection.reason || 'Content failed trust & safety inspection.',
        violatingFrame: inspection.violatingFrame
      });
      return;
    }

    // Determine chosen thumbnail:
    // Priority 1: Custom user-entered image URL (if typed)
    // Priority 2: Selected YouTube-style candidate keyframe
    // Priority 3: Default fallback
    let chosenThumbnail = customThumbnailUrl.trim();
    if (!chosenThumbnail && candidateThumbnails.length > 0 && candidateThumbnails[selectedThumbnailIndex]) {
      chosenThumbnail = candidateThumbnails[selectedThumbnailIndex].dataUrl;
    }
    if (!chosenThumbnail) {
      chosenThumbnail = 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop&q=80';
    }

    // Use dynamic extracted duration, falling back to 01:00 only if unreadable
    const finalDuration = extractedDuration || '01:00';
    const finalDurationSeconds = extractedDurationSeconds || 60;

    // Safety Passed: Assemble and Add Videos
    let newVideos = [];
    if (activeTab === 'files') {
      newVideos = selectedFiles.map((item, idx) => ({
        id: `vid-upload-${Date.now()}-${idx}`,
        title: selectedFiles.length === 1 ? (title || item.name) : item.name,
        description: description || `Uploaded local video: ${item.name}`,
        category: category || 'Uploaded',
        duration: finalDuration,
        durationSeconds: finalDurationSeconds,
        videoUrl: item.blobUrl,
        thumbnailUrl: chosenThumbnail,
        views: '1',
        rawViews: 1,
        uploadedAt: now,
        isFavorite: false,
        tags: tags.length > 0 ? tags : ['Uploaded', category],
        uploader: 'You',
        isCustomUpload: true,
        safetyStatus: 'Verified Safe'
      }));
    } else {
      newVideos = [
        {
          id: `vid-url-${Date.now()}`,
          title: title || 'External Web Video',
          description: description || 'Streamed from web video source.',
          category: category || 'Technology',
          duration: finalDuration,
          durationSeconds: finalDurationSeconds,
          videoUrl: videoUrlInput,
          thumbnailUrl: chosenThumbnail,
          views: '1',
          rawViews: 1,
          uploadedAt: now,
          isFavorite: false,
          tags: tags.length > 0 ? tags : ['WebStream', category],
          uploader: 'You (Web URL)',
          isCustomUpload: true,
          safetyStatus: 'Verified Safe'
        }
      ];
    }

    const rawFilesMap = {};
    if (activeTab === 'files') {
      newVideos.forEach((item, idx) => {
        if (selectedFiles[idx]?.file) {
          rawFilesMap[item.id] = selectedFiles[idx].file;
        }
      });
    }

    onAddVideos(newVideos, rawFilesMap);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    resetModeration();
    setViolationAlert(null);
    setCandidateThumbnails([]);
    setExtractedDuration('');
    setExtractedDurationSeconds(0);
    onClose();
  };

  const uploadCategories = CATEGORIES.filter((c) => c !== 'All' && c !== 'Favorites');

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div className="upload-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h3>
            <UploadCloud size={20} color="#3b82f6" />
            <span>Add Videos to Library</span>
          </h3>
          <button className="player-close-btn" onClick={handleCloseModal} title="Close" type="button">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Tab Switcher */}
          <div className="modal-tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('files');
                setViolationAlert(null);
              }}
            >
              Upload Local Video(s)
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('url');
                setViolationAlert(null);
              }}
            >
              Direct Video Link / URL
            </button>
          </div>

          {/* Tab 1: Local Files */}
          {activeTab === 'files' ? (
            <div>
              <div
                className={`dropzone-container ${isDragging ? 'drag-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files && handleFileSelection(e.target.files)}
                />
                <UploadCloud className="dropzone-icon" />
                <h4 className="dropzone-title">Click or drag & drop video files here</h4>
                <p className="dropzone-hint">
                  Supports MP4, WebM, OGG, MOV (Automatic Safety & NSFW Inspection)
                </p>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="queued-files-list">
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1' }}>
                    {selectedFiles.length} file(s) queued for upload:
                  </span>
                  {selectedFiles.map((fileItem) => (
                    <div key={fileItem.id} className="queued-file-item">
                      <div className="queued-file-info">
                        <Film size={15} color="#94a3b8" />
                        <span style={{ fontWeight: 500 }}>{fileItem.name}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>({fileItem.sizeMb} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQueuedFile(fileItem.id)}
                        className="icon-action-btn delete-btn"
                        title="Remove file"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Tab 2: URL Input */
            <div className="form-group">
              <label className="form-label">Direct Video Stream URL (.mp4 / .webm)</label>
              <input
                type="url"
                required={activeTab === 'url'}
                placeholder="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                onBlur={handleUrlBlur}
                className="form-input"
              />
            </div>
          )}

          {/* YouTube-Style Candidate Thumbnail Selector */}
          <div className="form-group" style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Thumbnail (YouTube-Style Selection)
              </label>
              {extractedDuration && (
                <span style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600 }}>
                  Detected Length: {extractedDuration}
                </span>
              )}
            </div>

            {isAnalyzingVideo ? (
              <div className="thumbnail-loading-box">
                <Loader2 size={16} className="spin-icon" color="#3b82f6" />
                <span>Reading video stream and extracting candidate frame choices...</span>
              </div>
            ) : candidateThumbnails.length > 0 ? (
              <div>
                <div className="candidate-thumbnails-grid">
                  {candidateThumbnails.map((frame, idx) => {
                    const isSelected = selectedThumbnailIndex === idx && !customThumbnailUrl;
                    return (
                      <div
                        key={idx}
                        className={`candidate-thumbnail-card ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedThumbnailIndex(idx);
                          setCustomThumbnailUrl('');
                        }}
                        title={`Select frame at ${frame.formattedTime}`}
                      >
                        <img src={frame.dataUrl} alt={`Frame ${idx + 1}`} />
                        <div className="candidate-time-badge">{frame.formattedTime}</div>
                        {isSelected && (
                          <div className="candidate-check-badge">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                        <span className="candidate-frame-label">
                          {idx === 1 ? 'Frame 2 (Recommended)' : `Frame ${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="thumbnail-helper-text">
                  Choose from auto-extracted frames above, or enter a custom image link below.
                </p>
              </div>
            ) : (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Select a video file or enter a valid URL to preview auto-extracted candidate thumbnails.
              </p>
            )}
          </div>

          {/* Custom Thumbnail URL Input (Optional) */}
          <div className="form-group">
            <label className="form-label">Custom Image Poster URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... (Overrides auto-selected frame)"
              value={customThumbnailUrl}
              onChange={(e) => setCustomThumbnailUrl(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Video Metadata Inputs */}
          <div className="form-group">
            <label className="form-label">Video Title {selectedFiles.length > 1 && '(Applied to batch)'}</label>
            <input
              type="text"
              placeholder="e.g., Amazing Nature Timelapse 4K"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input"
              required={activeTab === 'url'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                {uploadCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input
                type="text"
                placeholder="Action, 4K, Tutorial"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              placeholder="Brief description about the video content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
            />
          </div>

          {/* Active Moderation Scan Progress Indicator */}
          {isScanning && (
            <div className="moderation-scan-box">
              <div className="moderation-scan-header">
                <Loader2 size={16} className="spin-icon" color="#3b82f6" />
                <span>Automated Safety Check: {scanProgress}%</span>
              </div>
              <div className="moderation-progress-bar">
                <div
                  className="moderation-progress-fill"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="moderation-status-text">{statusMessage}</p>
            </div>
          )}

          {/* Safety Violation Alert Banner */}
          {violationAlert && (
            <div className="moderation-violation-card">
              <div className="violation-header">
                <ShieldAlert size={20} color="#f43f5e" />
                <h4>Upload Blocked: Safety Policy Violation</h4>
              </div>
              <p className="violation-category">
                <strong>Flagged Category:</strong> {violationAlert.category}
              </p>
              <p className="violation-reason">{violationAlert.reason}</p>
              {violationAlert.violatingFrame && (
                <div className="violating-frame-preview">
                  <span>Flagged keyframe snapshot:</span>
                  <img
                    src={violationAlert.violatingFrame}
                    alt="Flagged frame"
                    className="violating-frame-img"
                  />
                </div>
              )}
            </div>
          )}

          {/* FA-2 Viva & Testing Demonstration Mode */}
          <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', color: 'var(--text-muted)', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={simulateFlag}
                onChange={(e) => setSimulateFlag(e.target.checked)}
                style={{ accentColor: '#f43f5e', cursor: 'pointer' }}
              />
              <span><strong>[FA-2 Demo Mode]</strong> Simulate safety violation rejection (tests blocked state without requiring harmful media)</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer" style={{ padding: '16px 0 0 0', background: 'transparent' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCloseModal}
              disabled={isScanning || isAnalyzingVideo}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={
                isScanning ||
                isAnalyzingVideo ||
                (activeTab === 'files' && selectedFiles.length === 0)
              }
            >
              {isScanning ? (
                <>
                  <Loader2 size={16} className="spin-icon" />
                  <span>Scanning Video...</span>
                </>
              ) : (
                <>
                  <Plus size={16} />
                  <span>
                    {activeTab === 'files'
                      ? `Upload & Verify ${selectedFiles.length > 0 ? selectedFiles.length : ''} Video${selectedFiles.length > 1 ? 's' : ''}`
                      : 'Verify & Add Video'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
