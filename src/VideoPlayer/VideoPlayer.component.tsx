import "video.js/dist/video-js.css";
import useVideoPlayer from "./useVideoPlayer";
import type { UseVideoPlayerProps } from "./useVideoPlayer";

const VideoPlayerComponent = (props: UseVideoPlayerProps) => {
  const { videoRef } = useVideoPlayer(props);
  return (
    <div>
      <h1>Video player</h1>
      <div data-vjs-player>
        <div ref={videoRef as any} />
      </div>
    </div>
  );
};

export default VideoPlayerComponent;
