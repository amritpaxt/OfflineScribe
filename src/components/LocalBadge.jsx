/**
 * LocalBadge.jsx
 * Indicator showing that everything runs locally
 */

import React from 'react';

export function LocalBadge({ isModelLoaded, isLoading, loaderState, loaderProgress }) {
  const getStatus = () => {
    if (loaderState === 'downloading') {
      return { text: `⬇️ Downloading... ${loaderProgress}%`, className: 'loading' };
    }
    if (loaderState === 'loading') {
      return { text: '⏳ Loading Model...', className: 'loading' };
    }
    if (loaderState === 'error') {
      return { text: '❌ Load Failed - Retrying...', className: 'error' };
    }
    if (isModelLoaded) {
      return { text: '🟢 Running Locally · No Cloud', className: 'active' };
    }
    return { text: '⚪ Ready to Load', className: 'ready' };
  };

  const status = getStatus();

  return (
    <div className={`local-badge ${status.className}`}>
      {status.text}
    </div>
  );
}
