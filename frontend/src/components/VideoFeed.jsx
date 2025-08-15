import React, { useEffect, useRef } from 'react';

const VideoFeed = () => {
    const videoRef = useRef(null);

    useEffect(() => {
        async function getCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera: ", err);
            }
        }
        getCamera();
    }, []);

    return (
        <div className="w-80 h-80 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg mx-auto bg-gray-700">
            <video ref={videoRef} autoPlay muted className="w-full h-full object-cover scale-x-[-1]"></video>
        </div>
    );
};
export default VideoFeed;