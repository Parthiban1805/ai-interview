import React, { useEffect, useRef, useState } from 'react';

const VideoFeed = () => {
    const videoRef = useRef(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        let stream;
        async function getCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setIsCameraReady(true);
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
                setIsCameraReady(false); 
            }
        }
        getCamera();

        // Cleanup function to stop the camera when the component unmounts
        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []); // Empty dependency array ensures this runs only once

    return (
        <div className="w-80 h-80 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg mx-auto bg-gray-700 flex items-center justify-center">
            {!isCameraReady && (
                <p className="text-gray-400">Waiting for camera...</p>
            )}
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
};

export default VideoFeed;