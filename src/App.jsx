import React, { useState } from 'react';
import { useVideoStorage } from './hooks/useVideoStorage';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import CategoryFilter from './components/CategoryFilter';
import VideoGrid from './components/VideoGrid';
import CustomVideoPlayer from './components/CustomVideoPlayer';
import VideoUploadModal from './components/VideoUploadModal';
import Toast from './components/Toast';

export default function App() {
  // Persistent State Management via Custom Hook (FA-2 Requirement)
  const {
    videos,
    addVideos,
    deleteVideo,
    toggleFavorite,
    incrementViews,
    updateVideoDuration,
  } = useVideoStorage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals & Active playback state
  const [activeVideo, setActiveVideo] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Show auto-dismissing toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'success' });
    }, 3000);
  };

  // Toggle favorite state of a video (persists across reload)
  const handleToggleFavorite = (videoId) => {
    const { isFav, title } = toggleFavorite(videoId);
    showToast(
      isFav ? `Added "${(title || 'Video').substring(0, 24)}..." to Favorites` : 'Removed from Favorites',
      'info'
    );

    // Update active video if currently open
    if (activeVideo && activeVideo.id === videoId) {
      setActiveVideo((prev) => ({ ...prev, isFavorite: isFav }));
    }
  };

  // Delete a video from library (persists across reload)
  const handleDeleteVideo = async (videoId) => {
    await deleteVideo(videoId);
    if (activeVideo && activeVideo.id === videoId) {
      setActiveVideo(null);
    }
    showToast('Video removed from library', 'info');
  };

  // Add newly uploaded videos (persists to IndexedDB & localStorage)
  const handleAddVideos = async (newVideos, rawFilesMap = {}) => {
    await addVideos(newVideos, rawFilesMap);
    showToast(`Successfully saved ${newVideos.length} video(s) to library!`, 'success');
  };

  // Reset search and filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  // Filter pipeline
  const filteredVideos = videos.filter((vid) => {
    // Search match
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      vid.title.toLowerCase().includes(query) ||
      vid.description.toLowerCase().includes(query) ||
      (vid.tags && vid.tags.some((t) => t.toLowerCase().includes(query))) ||
      (vid.uploader && vid.uploader.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    // Category match
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Favorites') return vid.isFavorite === true;
    if (selectedCategory === 'Uploaded') return vid.isCustomUpload === true;
    return vid.category === selectedCategory;
  });

  // Sorting pipeline
  const sortedVideos = [...filteredVideos].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    }
    if (sortBy === 'duration') {
      return (b.durationSeconds || 0) - (a.durationSeconds || 0);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === 'views') {
      const getNum = (v) => {
        if (typeof v === 'string') {
          if (v.includes('M')) return parseFloat(v) * 1000000;
          if (v.includes('K')) return parseFloat(v) * 1000;
          return parseFloat(v) || 0;
        }
        return v || 0;
      };
      return getNum(b.views) - getNum(a.views);
    }
    return 0;
  });

  // Active playlist navigation
  const currentActiveIndex = activeVideo
    ? sortedVideos.findIndex((v) => v.id === activeVideo.id)
    : -1;

  const handleNextVideo = () => {
    if (currentActiveIndex >= 0 && currentActiveIndex < sortedVideos.length - 1) {
      setActiveVideo(sortedVideos[currentActiveIndex + 1]);
    }
  };

  const handlePrevVideo = () => {
    if (currentActiveIndex > 0) {
      setActiveVideo(sortedVideos[currentActiveIndex - 1]);
    }
  };

  const totalFavorites = videos.filter((v) => v.isFavorite).length;
  const customUploadsCount = videos.filter((v) => v.isCustomUpload).length;

  return (
    <div className="app-container">
      {/* Navbar with Search & Upload Action */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        totalVideos={videos.length}
        onResetFilters={handleResetFilters}
      />

      {/* Main Container */}
      <main className="main-content">
        {/* Hero Showcase & Stats */}
        <HeroBanner
          totalVideos={videos.length}
          totalFavorites={totalFavorites}
          customUploadsCount={customUploadsCount}
        />

        {/* Categories, Sort, and View Controls */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          totalFavorites={totalFavorites}
        />

        {/* Video Gallery Grid (Lists and Keys, Props, Event Handlers) */}
        <VideoGrid
          videos={sortedVideos}
          viewMode={viewMode}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          onPlay={(vid) => {
            setActiveVideo(vid);
            incrementViews(vid.id);
          }}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDeleteVideo}
          onResetFilters={handleResetFilters}
          onOpenUpload={() => setIsUploadModalOpen(true)}
        />
      </main>

      {/* Custom Video Player Modal (Conditional Rendering) */}
      {activeVideo && (
        <CustomVideoPlayer
          video={activeVideo}
          onClose={() => setActiveVideo(null)}
          onToggleFavorite={handleToggleFavorite}
          onNext={handleNextVideo}
          onPrev={handlePrevVideo}
          hasNext={currentActiveIndex >= 0 && currentActiveIndex < sortedVideos.length - 1}
          hasPrev={currentActiveIndex > 0}
          onDurationResolved={updateVideoDuration}
        />
      )}

      {/* Upload Modal (Conditional Rendering) */}
      <VideoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAddVideos={handleAddVideos}
      />

      {/* Action Toast Notifications */}
      {toast.message && <Toast message={toast.message} type={toast.type} />}

      {/* Footer */}
      <footer className="app-footer">
        <p>
          StreamVault Video Library • Developed for <strong>AWT Formative Assessment II (FA-2)</strong>
        </p>
      </footer>
    </div>
  );
}
