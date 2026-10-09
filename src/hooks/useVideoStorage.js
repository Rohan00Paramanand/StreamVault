import { useState, useEffect, useCallback } from 'react';
import {
  loadSavedMetadata,
  saveMetadata,
  saveVideoBlob,
  deleteVideoBlob,
  rehydrateVideos,
} from '../services/videoStorage';
import { parseViews, formatViews } from '../utils/videoMetadataHelper';

/**
 * Custom React Hook: useVideoStorage
 * Manages reactive persistent state across localStorage and IndexedDB (FA-2 Requirement)
 */
export function useVideoStorage() {
  const [videos, setVideos] = useState(() => loadSavedMetadata());
  const [isStorageReady, setIsStorageReady] = useState(false);

  // On initial mount, rehydrate all IndexedDB video blobs
  useEffect(() => {
    let isMounted = true;

    async function initStorage() {
      const stored = loadSavedMetadata();
      const rehydrated = await rehydrateVideos(stored);
      if (isMounted) {
        setVideos(rehydrated);
        setIsStorageReady(true);
      }
    }

    initStorage();

    return () => {
      isMounted = false;
    };
  }, []);

  // Add new videos (persisting binary file blobs to IndexedDB if present)
  const addVideos = useCallback(
    async (newVideos, rawFilesMap = {}) => {
      // 1. Store any local binary files into IndexedDB
      for (const item of newVideos) {
        const fileBlob = rawFilesMap[item.id];
        if (fileBlob) {
          await saveVideoBlob(item.id, fileBlob);
        }
      }

      // 2. Prepend to state and save metadata
      setVideos((prev) => {
        const next = [...newVideos, ...prev];
        saveMetadata(next);
        return next;
      });
    },
    []
  );

  // Delete a video (and its binary blob from IndexedDB)
  const deleteVideo = useCallback(
    async (videoId) => {
      await deleteVideoBlob(videoId);
      setVideos((prev) => {
        const next = prev.filter((v) => v.id !== videoId);
        saveMetadata(next);
        return next;
      });
    },
    []
  );

  // Toggle favorite status and sync to storage
  const toggleFavorite = useCallback(
    (videoId) => {
      let isFav = false;
      let targetTitle = '';

      setVideos((prev) => {
        const next = prev.map((vid) => {
          if (vid.id === videoId) {
            isFav = !vid.isFavorite;
            targetTitle = vid.title;
            return { ...vid, isFavorite: isFav };
          }
          return vid;
        });
        saveMetadata(next);
        return next;
      });

      return { isFav, title: targetTitle };
    },
    []
  );

  // Dynamically increment real view count when video is played
  const incrementViews = useCallback((videoId) => {
    setVideos((prev) => {
      const next = prev.map((vid) => {
        if (vid.id === videoId) {
          const currentViewsNumeric = parseViews(vid.views);
          const nextViewsNumeric = currentViewsNumeric + 1;
          const nextViewsFormatted = formatViews(nextViewsNumeric);
          return {
            ...vid,
            views: nextViewsFormatted,
            rawViews: nextViewsNumeric,
          };
        }
        return vid;
      });
      saveMetadata(next);
      return next;
    });
  }, []);

  // Update exact duration when video metadata is read during playback
  const updateVideoDuration = useCallback((videoId, duration, durationSeconds) => {
    setVideos((prev) => {
      const next = prev.map((vid) => {
        if (vid.id === videoId && (!vid.duration || vid.duration === '00:00' || vid.duration !== duration)) {
          return {
            ...vid,
            duration,
            durationSeconds,
          };
        }
        return vid;
      });
      saveMetadata(next);
      return next;
    });
  }, []);

  return {
    videos,
    isStorageReady,
    addVideos,
    deleteVideo,
    toggleFavorite,
    incrementViews,
    updateVideoDuration,
  };
}
