import React from 'react';
import { Film, UploadCloud, RotateCcw } from 'lucide-react';

export default function EmptyState({ searchQuery, selectedCategory, onReset, onOpenUpload }) {
  return (
    <div className="empty-state-card">
      <Film className="empty-state-icon" />
      <h3 className="empty-state-title">No Videos Found</h3>
      <p className="empty-state-desc">
        {searchQuery
          ? `We couldn't find any videos matching "${searchQuery}" in "${selectedCategory}".`
          : `There are currently no videos in the "${selectedCategory}" category.`}
      </p>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={onReset}>
          <RotateCcw size={16} />
          <span>Reset All Filters</span>
        </button>

        <button className="btn-primary" onClick={onOpenUpload}>
          <UploadCloud size={18} />
          <span>Upload a Video</span>
        </button>
      </div>
    </div>
  );
}
