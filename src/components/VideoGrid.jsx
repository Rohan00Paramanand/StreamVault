import React from 'react';
import VideoCard from './VideoCard';
import EmptyState from './EmptyState';

export default function VideoGrid({
  videos,
  viewMode,
  searchQuery,
  selectedCategory,
  onPlay,
  onToggleFavorite,
  onDelete,
  onResetFilters,
  onOpenUpload
}) {
  if (videos.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onReset={onResetFilters}
        onOpenUpload={onOpenUpload}
      />
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'videos-grid' : 'videos-list'}>
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          onPlay={onPlay}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
