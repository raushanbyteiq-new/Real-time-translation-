import React from "react";

export function VideoDisplay({ title, videoRef, remoteFloatingText }) {
  return (
    <div className="relative bg-gray-800 p-4 rounded-lg">
      <h4 className="font-semibold mb-3 text-blue-300">{title}</h4>

      {remoteFloatingText && (
        <div
          className="absolute left-1/2 transform -translate-x-1/2 bottom-4 px-4 py-2 rounded-lg text-white text-sm bg-black bg-opacity-70"
          style={{ zIndex: 20 }}
        >
          {remoteFloatingText}
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        muted={title === "Your Video"}
        playsInline
        className="w-full rounded-lg shadow-lg bg-black"
      />
    </div>
  );
}
