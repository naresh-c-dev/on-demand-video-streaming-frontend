import "./App.css";
import useApp from "./useApp";
import VideoPlayerComponent from "./VideoPlayer/VideoPlayer.component";

function App() {
  const { videoContent } = useApp();

  return <>{videoContent && <VideoPlayerComponent {...videoContent} />}</>;
}

export default App;
