/**
 * Video Metadata and Frame Analysis Helper
 * Dynamically computes duration, extracts YouTube-style candidate thumbnails,
 * and formats view counts.
 */

/**
 * Formats seconds into standard mm:ss or hh:mm:ss timecode
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatDuration(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const rounded = Math.round(totalSeconds);
  const h = Math.floor(rounded / 3600);
  const m = Math.floor((rounded % 3600) / 60);
  const s = rounded % 60;

  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Parses numeric or shorthand view counts (e.g. '1.4M' -> 1400000, '890K' -> 890000)
 * @param {string|number} views
 * @returns {number}
 */
export function parseViews(views) {
  if (typeof views === 'number') return views;
  if (!views) return 0;
  const str = String(views).trim().toUpperCase();
  if (str.endsWith('M')) {
    return Math.round(parseFloat(str) * 1_000_000);
  }
  if (str.endsWith('K')) {
    return Math.round(parseFloat(str) * 1_000);
  }
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

/**
 * Formats a raw view count back into human-readable shorthand
 * @param {number} count
 * @returns {string}
 */
export function formatViews(count) {
  if (isNaN(count) || count < 0) return '0';
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (count >= 10_000) {
    return Math.round(count / 1_000) + 'K';
  }
  if (count >= 1_000) {
    return (count / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return count.toLocaleString();
}

/**
 * Inspects a video file or stream URL to extract:
 * 1. Exact real duration (in seconds and formatted mm:ss)
 * 2. Three YouTube-style candidate keyframe thumbnails across the timeline
 * 
 * @param {File|string} videoSource
 * @param {number} frameCount - default 3
 * @returns {Promise<{ duration: string, durationSeconds: number, frames: Array<{ time: number, formattedTime: string, dataUrl: string, blob: Blob }> }>}
 */
export async function inspectVideoAndGenerateThumbnails(videoSource, frameCount = 3) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const sourceUrl = typeof videoSource === 'string'
      ? videoSource
      : URL.createObjectURL(videoSource);

    video.src = sourceUrl;

    const cleanup = () => {
      if (typeof videoSource !== 'string') {
        URL.revokeObjectURL(sourceUrl);
      }
      video.remove();
    };

    video.onloadedmetadata = async () => {
      try {
        const rawDuration = video.duration || 0;
        const durationSeconds = Math.round(rawDuration);
        const formattedDuration = formatDuration(rawDuration);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 360;

        // Sample 3 candidate points across video timeline (e.g. 15%, 50%, 80%)
        const sampleRatios = [0.15, 0.50, 0.80];
        const frames = [];

        for (let i = 0; i < Math.min(frameCount, sampleRatios.length); i++) {
          const ratio = sampleRatios[i];
          const time = Math.max(0.5, Math.min(Math.max(0.5, rawDuration - 0.5), ratio * rawDuration));

          await seekVideo(video, time);

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));

          frames.push({
            index: i + 1,
            time: Math.round(time),
            formattedTime: formatDuration(time),
            dataUrl,
            blob,
          });
        }

        cleanup();
        resolve({
          duration: formattedDuration,
          durationSeconds,
          frames,
        });
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Unable to read video stream metadata.'));
    };
  });
}

function seekVideo(video, time) {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = time;
  });
}
