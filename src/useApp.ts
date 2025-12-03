import axios from "axios";
import { useState, useEffect } from "react";
import type { VideoInfo } from "./VideoPlayer/useVideoPlayer";

const SAMPLE_S3_FILE_KEY = "file1/result/hls/sample_video_1080p.m3u8";
const HLS_MIME_TYPE = "application/x-mpegURL"; // mime-type for HLS protocol

/**
 * Continue :
 * 1. Finish frontend function call to backend
 * 2. Init new service to grant access to Cloudfront + Signed cookies
 * 3. Create Cloudfront distribution
 * 4. Finish second service to grant access to Cloudfront
 * 5. Setup CORS on backend
 * 6. Talk about deployments
 */
const useApp = () => {
  const [videoContent, setVideoContent] = useState<VideoInfo | undefined>(
    undefined
  );

  const handleGetFileInfo = async () => {
    const mimeType = HLS_MIME_TYPE;

    const result = await axios.get(
      `http://localhost:3000/api/v1/courses/lecture/4295059a-1317-459c-a757-49ce72037c8a/playback`,
      {
        withCredentials: true, // to set cookies from backend to frontend
      }
    );
    const data = result.data.data.playback.masterPlaylistUrl as string;
    setVideoContent({
      videoSrc: data, // Cloudfront playlist file url (.m3u8)
      videoMimeType: mimeType,
    });
  };

  useEffect(() => {
    handleGetFileInfo();
  }, []);

  return {
    videoContent,
  };
};

export default useApp;
