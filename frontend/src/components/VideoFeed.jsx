// src/components/VideoFeed.jsx
import React, { useRef, useEffect } from 'react';

const VideoFeed = ({ stream }) => { // Accept stream as a prop
  const videoRef = useRef(null);

  useEffect(() => {
    // If we have a stream and a video element, attach the stream
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
    // Cleanup function to stop tracks when the component unmounts or stream changes
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full bg-gray-800 flex items-center justify-center rounded-lg">
        <div className="text-center text-gray-400">
          <div className="text-2xl mb-2">📷</div>
          <div className="text-xs">Awaiting camera...</div>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover bg-gray-800"
      style={{ transform: 'scaleX(-1)' }} // Mirror effect
    />
  );
};

export default VideoFeed;