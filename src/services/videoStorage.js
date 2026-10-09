/**
 * StreamVault Persistent Storage Service
 * Uses HTML5 IndexedDB for large binary video files (supports hundreds of MBs/GBs)
 * Uses localStorage for video metadata and favorite state persistence.
 */

import { INITIAL_VIDEOS } from '../data/initialVideos';

const DB_NAME = 'StreamVaultDB';
const DB_VERSION = 1;
const BLOB_STORE = 'video_blobs';
const METADATA_KEY = 'streamvault_videos_metadata_v2';

/**
 * Open or initialize IndexedDB connection
 * @returns {Promise<IDBDatabase>}
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Stores a binary video Blob in IndexedDB
 * @param {string} id - Video ID
 * @param {Blob|File} blob - Video file blob
 */
export async function saveVideoBlob(id, blob) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(BLOB_STORE, 'readwrite');
      const store = transaction.objectStore(BLOB_STORE);
      const request = store.put({ id, blob, timestamp: Date.now() });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save video blob to IndexedDB:', err);
    return false;
  }
}

/**
 * Retrieves a binary video Blob from IndexedDB
 * @param {string} id - Video ID
 * @returns {Promise<Blob|null>}
 */
export async function getVideoBlob(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(BLOB_STORE, 'readonly');
      const store = transaction.objectStore(BLOB_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result?.blob || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to get video blob from IndexedDB:', err);
    return null;
  }
}

/**
 * Removes a video blob from IndexedDB
 * @param {string} id - Video ID
 */
export async function deleteVideoBlob(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(BLOB_STORE, 'readwrite');
      const store = transaction.objectStore(BLOB_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to delete video blob from IndexedDB:', err);
    return false;
  }
}

/**
 * Loads video metadata from localStorage, falling back to INITIAL_VIDEOS
 * @returns {Array}
 */
export function loadSavedMetadata() {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    if (!raw) return INITIAL_VIDEOS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VIDEOS;
  } catch (err) {
    console.error('Failed to parse metadata from localStorage:', err);
    return INITIAL_VIDEOS;
  }
}

/**
 * Saves video metadata array to localStorage (omitting session-only blob URLs)
 * @param {Array} videos
 */
export function saveMetadata(videos) {
  try {
    const serialized = videos.map((v) => {
      // Don't save temporary blob: URLs to localStorage since they expire on reload
      const cleanVideoUrl = v.videoUrl && v.videoUrl.startsWith('blob:') ? '' : v.videoUrl;
      return {
        ...v,
        videoUrl: cleanVideoUrl,
        hasStoredBlob: v.hasStoredBlob || (v.isCustomUpload && !v.videoUrl?.startsWith('http')),
      };
    });
    localStorage.setItem(METADATA_KEY, JSON.stringify(serialized));
  } catch (err) {
    console.error('Failed to save metadata to localStorage:', err);
  }
}

/**
 * Rehydrates video playback URLs for stored IndexedDB blobs upon page load
 * @param {Array} videosList
 * @returns {Promise<Array>}
 */
export async function rehydrateVideos(videosList) {
  const rehydrated = await Promise.all(
    videosList.map(async (item) => {
      // If it's a remote URL (http/https), it's already playable
      if (item.videoUrl && item.videoUrl.startsWith('http')) {
        return item;
      }

      // If it's a locally uploaded video, retrieve blob from IndexedDB
      if (item.hasStoredBlob || item.isCustomUpload) {
        const blob = await getVideoBlob(item.id);
        if (blob) {
          const freshBlobUrl = URL.createObjectURL(blob);
          return {
            ...item,
            videoUrl: freshBlobUrl,
          };
        }
      }

      return item;
    })
  );

  return rehydrated;
}
