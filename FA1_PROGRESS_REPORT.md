# Formative Assessment – I (FA-1) Progress Report
**Course:** Advanced Web Technologies / Web Application Development  
**Assessment Type:** Formative Assessment – I (Mini Project Phase I)  
**Total Marks:** 10 (Scaled from 100)  
**Project Title:** StreamVault – Interactive Video Gallery & Player Application  
**Developer:** Individual Mini Project Submission  
**Date of Submission:** August 31, 2026  

---

## 1. Problem Identification & Motivation

With the exponential growth of rich multimedia consumption, modern web applications frequently require performant, responsive, and intuitive video management interfaces. Users commonly encounter several pain points with generic web media tools:
- **Cluttered User Interfaces:** Inconsistent playback layouts, distracting ads, and poor responsiveness across mobile and desktop devices.
- **Limited Multi-File Local Ingestion:** Lack of seamless drag-and-drop ingestion allowing users to organize, preview, and play multiple local video files directly in a unified client-side dashboard without heavy server requirements.
- **Inflexible Media Controls:** Default HTML5 video player controls lack modern conveniences such as fine-grained playback speed multipliers, rapid keyboard shortcuts, dynamic playlist scrubbing, buffered state indicators, and category-driven filtering.

### 1.1 Objective
To develop a high-performance, responsive, component-based **Video Gallery and Custom Video Player** web application using **JavaScript (ES6+)** and **React.js**. The application addresses real-world multimedia management needs through clean modular architecture, reactive state management, multiple file uploads, dynamic metadata tagging, and a custom player.

---

## 2. Requirement Analysis

### 2.1 Functional Requirements
1. **Video Ingestion & Uploads:**
   - Support single and multiple video file uploads (`.mp4`, `.webm`, `.ogg`, `.mov`) via interactive drag-and-drop or file dialog.
   - Support adding external direct video streaming URLs.
   - Extract and assign metadata (Title, Category, Tags, Description, Timestamp, File size).
2. **Dynamic Gallery & Categorization:**
   - Display a responsive grid and list view of available videos.
   - Filter videos dynamically by category (*3D Animation, Nature, Technology, Trailers, Sports, Uploaded, Favorites*).
   - Real-time search query filtering across title, description, creator, and tags.
   - Multi-criteria sorting (*Newest, Most Viewed, Duration, Title A–Z*).
3. **Custom HTML5 Video Player:**
   - Custom player controls overlay (Play/Pause, Scrubber progress bar, Buffered indicators, Time formatting).
   - Audio volume controls with slider and one-click mute/unmute.
   - Multi-speed playback selector (0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x).
   - Picture-in-Picture (PiP) and full-screen toggle modes.
   - Sequential playlist navigation (Next / Previous video buttons).
   - Global keyboard shortcuts (`Space` = Play/Pause, `Left/Right Arrows` = 5s Skip, `Up/Down Arrows` = Volume, `M` = Mute, `F` = Fullscreen, `Esc` = Close).
4. **Favorites & Library Management:**
   - Toggle favorite status on any video item.
   - Remove/delete videos from the active library with confirmation prompts.

### 2.2 Non-Functional Requirements
- **Responsiveness:** Fluid adaptation across mobile (<768px), tablet, and desktop (1400px+) viewports.
- **Performance:** Instant local rendering using Vite, React 18 virtual DOM reconciliation, and lightweight SVG poster generation.
- **Resilience & Error Handling:** Graceful fallbacks for broken image links, offline poster generation, and network-restricted video stream handling.

---

## 3. System Architecture & Component Hierarchy

The project adopts a decoupled, modular component structure following React best practices:

```text
StreamVault (c:/AWT/MiniProject)
├── src/
│   ├── main.jsx                    # Application entry point (ReactDOM.createRoot)
│   ├── App.jsx                     # Core state orchestrator (useState, event dispatchers)
│   ├── data/
│   │   └── initialVideos.js        # Seed video repository & category constants
│   ├── utils/
│   │   └── thumbnailGenerator.js   # Dynamic offline SVG poster generation utility
│   ├── components/
│   │   ├── Navbar.jsx              # Header, search input, stats pill, upload trigger
│   │   ├── HeroBanner.jsx          # Metric cards and feature showcase banner
│   │   ├── CategoryFilter.jsx      # Category pill tabs, sorting selector, view toggle
│   │   ├── VideoGrid.jsx           # Lists and keys container with responsive grid
│   │   ├── VideoCard.jsx           # Individual video card with hover preview & actions
│   │   ├── CustomVideoPlayer.jsx   # Custom video player modal, controls, & shortcuts
│   │   ├── VideoUploadModal.jsx    # Drag-and-drop multi-file upload modal
│   │   ├── EmptyState.jsx          # Conditional empty-result placeholder
│   │   └── Toast.jsx               # Feedback notification alerts
│   └── styles/
│       └── index.css               # Design system & dark glassmorphism styling
├── package.json
└── vite.config.js
```

### Component Hierarchy Flow:
```mermaid
graph TD
    App[App.jsx - Root State]
    App --> Navbar[Navbar.jsx]
    App --> HeroBanner[HeroBanner.jsx]
    App --> CategoryFilter[CategoryFilter.jsx]
    App --> VideoGrid[VideoGrid.jsx]
    VideoGrid --> VideoCard[VideoCard.jsx (Mapped with key=video.id)]
    VideoGrid --> EmptyState[EmptyState.jsx (Conditional)]
    App --> CustomVideoPlayer[CustomVideoPlayer.jsx (Modal View)]
    App --> VideoUploadModal[VideoUploadModal.jsx (Upload View)]
    App --> Toast[Toast.jsx (Feedback Notification)]
```

---

## 4. Implementation of JavaScript & React Fundamentals (FA-1 Rubric Mapping)

| React & ES6+ Fundamental | Implementation in StreamVault |
| :--- | :--- |
| **Functional Components** | All UI units (`Navbar`, `VideoCard`, `CustomVideoPlayer`, etc.) are written as pure functional components. |
| **JSX Syntax** | Declarative JSX structure incorporating semantic HTML5 elements (`<header>`, `<main>`, `<article>`, `<video>`). |
| **Props Passing** | Data flows unidirectionally from `App.jsx` to children (e.g., passing `video` metadata object and action callbacks `onPlay`, `onToggleFavorite`, `onDelete` to `VideoCard`). |
| **State Management (`useState`)** | Managed states in `App.jsx` and sub-components: `videos`, `activeVideo`, `searchQuery`, `selectedCategory`, `sortBy`, `viewMode`, `isUploadModalOpen`, `isPlaying`, `currentTime`, `duration`, `volume`. |
| **Event Handling** | Implemented `onClick`, `onChange`, `onDrop`, `onDragOver`, `onTimeUpdate`, `onLoadedMetadata`, `onError`, and global `keydown` event listeners. |
| **Conditional Rendering** | Used ternary and logical `&&` operators to conditionally render the player modal (`activeVideo && <CustomVideoPlayer ... />`), upload modal, play/pause buttons, and empty search states. |
| **Lists and Keys** | Dynamic iteration over video arrays using `videos.map(video => <VideoCard key={video.id} ... />)` ensuring efficient virtual DOM reconciliation. |
| **ES6+ Modern Features** | Arrow functions, destructuring assignment, template literals, spread syntax (`[...prev, ...newVideos]`), array methods (`filter`, `map`, `sort`, `findIndex`). |

---

## 5. UI/UX & Wireframe Design

1. **Dark Glassmorphism Theme:** High-contrast slate background (`#0a0e17`) with translucent glass card backdrops, subtle neon indigo borders (`#6366f1`), and smooth CSS cubic-bezier transitions.
2. **Interactive Cards:** Hover scale effects, duration badge overlays, instant favorite status badges, and quick-play triggers.
3. **Theater Player Modal:** Fixed backdrop blur overlay (`backdrop-filter: blur(20px)`), auto-hiding custom bottom control bar, responsive scrubber, and full video details panel.

---

## 6. Current Implementation Status & FA-2 Roadmap

### 6.1 Completed in FA-1 (Phase I)
- [x] Full React project setup using Vite and standard modular folder structure.
- [x] Core state management and unidirectional props flow.
- [x] Multi-file drag-and-drop video upload and direct URL stream ingestion.
- [x] Comprehensive custom video player with full custom controls and keyboard bindings.
- [x] Real-time category filtering, search querying, and multi-criteria sorting.
- [x] Error handling with resilient offline SVG poster generators.

### 6.2 Planned for FA-2 (Phase II)
- **Advanced React Hooks:** Custom hooks (`useLocalStorage`, `useVideoPlayer`), `useReducer` for complex playback state, `useMemo` for heavy filter memoization.
- **Client-Side Routing:** `react-router-dom` for dedicated video detail pages (`/watch/:id`), playlist pages (`/playlists`), and channel views (`/channel`).
- **Persistent Storage / API Integration:** Integration with `localStorage` / IndexedDB or a REST API / JSON-Server for persistent backend CRUD storage.
- **Form Validation & Testing:** Advanced schema validation for video uploads and automated unit/integration testing.
- **Cloud Deployment:** Live deployment on Vercel / Netlify with CI/CD GitHub repository synchronization.

---
*Submitted for evaluation under FA-1 Formative Assessment.*
