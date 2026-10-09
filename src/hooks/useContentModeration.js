import { useState, useCallback } from 'react';
import { verifyVideoContent } from '../services/contentModeration';

/**
 * Custom React Hook for Content Moderation Pipeline (FA-2 Requirement)
 */
export function useContentModeration() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const resetModeration = useCallback(() => {
    setIsScanning(false);
    setScanProgress(0);
    setStatusMessage('');
    setScanResult(null);
    setError(null);
  }, []);

  const runModeration = useCallback(async (videoSource, metadata = {}) => {
    setIsScanning(true);
    setScanProgress(5);
    setStatusMessage('Initiating content security inspection...');
    setError(null);

    try {
      const outcome = await verifyVideoContent(
        videoSource,
        metadata,
        (progress, msg) => {
          setScanProgress(progress);
          setStatusMessage(msg);
        }
      );

      setScanResult(outcome);
      setIsScanning(false);
      return outcome;
    } catch (err) {
      setError(err.message || 'Content moderation scan encountered an error.');
      setIsScanning(false);
      return {
        isApproved: false,
        reason: err.message || 'Scanning process failed',
      };
    }
  }, []);

  return {
    isScanning,
    scanProgress,
    statusMessage,
    scanResult,
    error,
    runModeration,
    resetModeration,
  };
}
