import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ videoUrl, onEnded }) => {
  if (!videoUrl) {
    return (
      <div className="w-full rounded-lg bg-slate-900 p-6 text-center text-sm text-slate-300 shadow-sm">
        Video không khả dụng.
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-lg shadow-sm"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="aspect-video w-full bg-black">
        <ReactPlayer
          src={videoUrl}
          width="100%"
          height="100%"
          controls
          playsInline
          controlsList="nodownload"
          onEnded={onEnded}
          config={{
            html: {
              attributes: {
                controlsList: "nodownload",
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
