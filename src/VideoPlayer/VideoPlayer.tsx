import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface VideoPlayerProps {
  lectureId: string;
  apiBaseUrl: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lectureId,
  apiBaseUrl,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playbackData, setPlaybackData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaybackData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch playback data with credentials to receive cookies
        const response = await fetch(
          `${apiBaseUrl}/api/v1/courses/lecture/4295059a-1317-459c-a757-49ce72037c8a/playback`,
          {
            method: "GET",
            credentials: "include", // IMPORTANT: Include cookies
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch playback data: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data) {
          throw new Error("Invalid playback data received");
        }

        setPlaybackData(data.data);
      } catch (err) {
        console.error("Error fetching playback data:", err);
        setError(err instanceof Error ? err.message : "Failed to load video");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaybackData();
  }, [lectureId, apiBaseUrl]);

  useEffect(() => {
    if (!playbackData || !videoRef.current) return;

    const video = videoRef.current;
    const masterPlaylistUrl = playbackData.playback.masterPlaylistUrl;
    console.log("Master Playlist URL:", masterPlaylistUrl);
    // Check if HLS is supported
    if (Hls.isSupported()) {
      // Use HLS.js for browsers that don't natively support HLS
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        xhrSetup: (xhr, url) => {
          // Ensure credentials are included for CloudFront signed cookies
          console.log("Setting XHR withCredentials for URL:", url);
          xhr.withCredentials = true;
        },
      });

      hlsRef.current = hls;

      hls.loadSource(masterPlaylistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("HLS manifest loaded successfully");
        // Get available quality levels
        const levels = hls.levels;
        console.log("Available quality levels:", levels);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        console.log("HLS Error event:", event);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error, attempting recovery...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error, attempting recovery...");
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, destroying HLS instance");
              hls.destroy();
              setError("Failed to load video stream");
              break;
          }
        }
      });

      // Cleanup
      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = masterPlaylistUrl;

      video.addEventListener("error", (e) => {
        console.error("Video error:", e);
        setError("Failed to load video");
      });
    } else {
      setError("HLS is not supported in this browser");
    }
  }, [playbackData]);

  if (loading) {
    return (
      <div className="video-player-loading">
        <div className="spinner">Loading video...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-player-error">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!playbackData) {
    return null;
  }

  return (
    <div className="video-player-container">
      <div className="video-info">
        <h2>{playbackData.title}</h2>
        {playbackData.description && <p>{playbackData.description}</p>}
        {playbackData.durationSeconds && (
          <span className="duration">
            Duration: {Math.floor(playbackData.durationSeconds / 60)}:
            {(playbackData.durationSeconds % 60).toString().padStart(2, "0")}
          </span>
        )}
      </div>

      <video
        ref={videoRef}
        controls
        preload="auto"
        className="video-element"
        crossOrigin="use-credentials"
        poster={
          playbackData.thumbnailKey
            ? `${apiBaseUrl}/thumbnails/${playbackData.thumbnailKey}`
            : undefined
        }
        style={{
          width: "100%",
          maxWidth: "1280px",
          height: "auto",
        }}
      >
        Your browser does not support the video tag.
      </video>

      {playbackData.playback.availableQualities && (
        <div className="quality-info">
          Available qualities:{" "}
          {playbackData.playback.availableQualities.join(", ")}
        </div>
      )}
    </div>
  );
};

// Example usage
export default function VideoLecturePage() {
  return (
    <div className="lecture-page">
      <VideoPlayer
        lectureId="your-lecture-id"
        apiBaseUrl="https://your-api-domain.com"
      />
    </div>
  );
}
