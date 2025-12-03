import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { VideoPlayer } from "./VideoPlayer/VideoPlayer.tsx";
// Import env API base URL

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VideoPlayer
      lectureId=""
      apiBaseUrl={import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}
    />
  </StrictMode>
);
