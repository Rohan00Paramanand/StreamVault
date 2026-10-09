# StreamVault – FA-1 Demonstration & Viva Cheat-Sheet

Use this quick guide to confidently demonstrate your project and answer technical questions from the examiner during the **FA-1 Viva**.

---

## 1. Quick Demonstration Workflow (2-Minute Demo)

1. **Overview & Landing Page:**
   - Run `npm run dev` and open `http://localhost:5173`.
   - Point out the **Header / Navbar** (Search bar, Total video count pill, "Upload Video" button).
   - Point out the **Hero Banner** displaying real-time metrics (Total videos, Uploads, Favorites).
2. **Filtering & Searching:**
   - Click on different category pills (*3D Animation, Nature, Technology*). Explain that this triggers `selectedCategory` state update in React.
   - Type in the search box (e.g. `Bunny` or `Nature`). Explain how `filteredVideos` dynamically updates using JavaScript array `.filter()`.
   - Switch between **Grid View** and **List View** to show responsive layout flexibility.
3. **Custom Video Player:**
   - Click on any video card to open the **Custom Video Player Modal**.
   - Demonstrate:
     - Play / Pause (click stage or press `Spacebar`).
     - Progress scrubber seek bar (click anywhere on the progress line).
     - Volume control slider & Mute button (`M`).
     - Playback speed dropdown (e.g. set to `1.5x` or `2.0x`).
     - Fullscreen toggle (`F`) and Picture-in-Picture (`PiP`).
     - Next / Previous video navigation buttons.
4. **Single & Multiple Video Upload:**
   - Click the **"Upload Video"** button.
   - Select or drag & drop video files from your computer (e.g. any `.mp4` file).
   - Add title, category, and tags, then submit.
   - Show how the newly uploaded video immediately appears in the gallery and plays in the custom player!
5. **Favorites & Deletion:**
   - Click the heart icon to favorite/unfavorite a video and check the **Favorites** category tab.
   - Click the trash icon to delete a video and show state removal.

---

## 2. Common Viva Questions & Model Answers

### Q1: What is the role of `useState` in your project?
> **Answer:** `useState` is a React hook that allows functional components to maintain local state. In this project, `useState` is used in `App.jsx` to track the array of videos, the active video being played, the search query, selected category filter, sort preference, view mode, and modal visibility states. When state changes, React automatically re-renders the relevant components.

### Q2: How do Props work in this application?
> **Answer:** Props (properties) enable unidirectional data flow from parent components to child components. For example, `App.jsx` passes the `video` object down to `VideoCard.jsx`, as well as callback functions like `onPlay`, `onToggleFavorite`, and `onDelete` so the child component can notify the parent when a user takes an action.

### Q3: Why is the `key` prop required when rendering the video list?
> **Answer:** In `VideoGrid.jsx`, we use `videos.map(video => <VideoCard key={video.id} ... />)`. The `key` prop provides a stable identity for each list item in React's Virtual DOM reconciliation algorithm. It allows React to identify which items have changed, been added, or removed, ensuring high rendering performance.

### Q4: How is Conditional Rendering implemented?
> **Answer:** We use JavaScript logical `&&` and ternary operators to conditionally render UI elements:
> 1. The custom player modal only renders when `activeVideo` is non-null: `{activeVideo && <CustomVideoPlayer ... />}`.
> 2. The upload modal only renders when `isUploadModalOpen` is true.
> 3. If no videos match the search query, `EmptyState` is rendered instead of the video grid.

### Q5: How do you handle video file uploads in the browser without a backend in Phase-I?
> **Answer:** We use the HTML5 File API and `URL.createObjectURL(file)` to generate a temporary client-side blob URL for the selected local video files. This allows instant local playback, metadata preview, and testing in the browser before Phase-II backend integration.

### Q6: How does the custom video player control HTML5 media?
> **Answer:** We use a React `useRef` to create a direct reference to the `<video>` HTML element (`videoRef.current`). This allows programmatic control over video playback methods (`.play()`, `.pause()`), properties (`.currentTime`, `.duration`, `.volume`, `.playbackRate`, `.muted`), and event listeners (`onTimeUpdate`, `onLoadedMetadata`, `onError`).

---
*Good luck with your FA-1 demonstration!*
