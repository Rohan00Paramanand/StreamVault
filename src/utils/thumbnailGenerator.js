// Minimalist cinematic SVG poster generator (clean, lightweight, zero-dependency, works completely offline)
export function getCategoryPoster(title, category) {
  // Sophisticated, muted dark palettes for each category
  const themeMap = {
    '3D Animation': { bg1: '#121624', bg2: '#1b2238', accent: '#6366f1', glyph: '3D' },
    'Nature': { bg1: '#0e1916', bg2: '#152620', accent: '#10b981', glyph: 'GEO' },
    'Technology': { bg1: '#0f1724', bg2: '#182436', accent: '#38bdf8', glyph: 'SYS' },
    'Trailers': { bg1: '#1c1318', bg2: '#2b1a22', accent: '#f43f5e', glyph: 'CINEMA' },
    'Sports': { bg1: '#1a1610', bg2: '#282015', accent: '#f59e0b', glyph: 'MOTION' },
    'Uploaded': { bg1: '#13151f', bg2: '#1f2233', accent: '#818cf8', glyph: 'MEDIA' },
    'Favorites': { bg1: '#1b1219', bg2: '#2b1b26', accent: '#fb7185', glyph: 'STAR' }
  };

  const theme = themeMap[category] || { bg1: '#12141c', bg2: '#1a1e2a', accent: '#94a3b8', glyph: 'MEDIA' };

  // Escape special XML characters in title
  const safeTitle = (title || 'Video')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const displayTitle = safeTitle.length > 32 ? safeTitle.substring(0, 32) + '...' : safeTitle;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="800" height="450">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${theme.bg1}" />
        <stop offset="100%" stop-color="${theme.bg2}" />
      </linearGradient>
      <radialGradient id="ambientGlow" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.12" />
        <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0" />
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.025)" stroke-width="1"/>
      </pattern>
    </defs>
    
    <!-- Base Canvas -->
    <rect width="800" height="450" fill="url(#cardGrad)" />
    <rect width="800" height="450" fill="url(#grid)" />
    <rect width="800" height="450" fill="url(#ambientGlow)" />
    
    <!-- Sleek Minimalist Geometric Motif -->
    <circle cx="400" cy="205" r="90" fill="none" stroke="rgba(255, 255, 255, 0.04)" stroke-width="1.5" />
    <circle cx="400" cy="205" r="54" fill="none" stroke="${theme.accent}" stroke-opacity="0.2" stroke-width="1" />
    
    <!-- Minimalist Center Film Glyph -->
    <polygon points="394,192 414,205 394,218" fill="rgba(255, 255, 255, 0.25)" />
    
    <!-- Subtle Category Tag in Center -->
    <text x="400" y="278" fill="rgba(255, 255, 255, 0.45)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" letter-spacing="3" text-anchor="middle">${theme.glyph}</text>
    
    <!-- Subtle Title at bottom -->
    <text x="400" y="380" fill="rgba(255, 255, 255, 0.65)" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="500" letter-spacing="0.5" text-anchor="middle">${displayTitle}</text>
  </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
