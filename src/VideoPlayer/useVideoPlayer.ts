import { useRef, useEffect } from "react";
import videojs from "video.js";

export interface VideoInfo {
  videoSrc: string;
  videoMimeType: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UseVideoPlayerProps extends VideoInfo {}

const useVideoPlayer = ({ videoSrc, videoMimeType }: UseVideoPlayerProps) => {
  const videoRef = useRef<HTMLDivElement>();
  const playerRef = useRef(null);

  /**
   * Define video options to be sent to player
   */
  const getVideoOptions = () => {
    let source = {
      src: videoSrc,
      type: videoMimeType,
      withCredentials: true, // to send Signed Cookies to Cloudfront
    } as any;

    return {
      autoplay: false,
      controls: true,
      responsive: true,

      fluid: true,
      sources: [source],
    };
  };

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    const options = getVideoOptions();
    console.log("setup videoJS options >> ", { options });

    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement("video-js");

      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current?.appendChild(videoElement as HTMLDivElement);

      const player = videojs(videoElement, options, () => {
        // onVideoPlayerReady(player);
      });

      playerRef.current = player;

      //   (player as any).hlsQualitySelector({ // for this, you must install https://www.npmjs.com/package/videojs-hls-quality-selector
      //     displayCurrentQuality: true,
      //   });
    }
  }, [videoRef.current, videoSrc, videoMimeType]);

  return {
    videoRef,
  };
};

export default useVideoPlayer;
