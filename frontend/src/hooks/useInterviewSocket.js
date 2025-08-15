import { useState, useRef, useCallback } from 'react';

// A unique client ID for the WebSocket session
const CLIENT_ID = `web_${Date.now()}`;

export const useInterviewSocket = () => {
    const [status, setStatus] = useState('Idle');
    const [isAwaitingFileUpload, setIsAwaitingFileUpload] = useState(false);
    
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioPlayerRef = useRef(new Audio()); // Use a single audio element

    const connectSocket = useCallback(() => {
        if (socketRef.current) return;
        
        setStatus('Connecting...');
        const ws = new WebSocket(`ws://localhost:8000/ws/${CLIENT_ID}`);
        socketRef.current = ws;

        ws.onopen = () => setStatus('Connected');
        ws.onclose = () => setStatus('Finished');
        ws.onerror = (err) => {
            console.error('WebSocket Error:', err);
            setStatus('Error');
        };

        ws.onmessage = async (event) => {
            // The backend will only send complete audio files now
            if (event.data instanceof Blob) {
                stopRecording();
                setStatus('AI Speaking...');

                const audioUrl = URL.createObjectURL(event.data);
                const audio = audioPlayerRef.current;
                audio.src = audioUrl;
                audio.play();

                // When the audio finishes playing, start recording for the user's turn
                audio.onended = () => {
                    setStatus('Listening...');
                    startRecording();
                };
            }
        };
    }, []);

    const startRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
            mediaRecorderRef.current.start(1500); // Send chunks or record until silence
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };

    const startInterview = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            // Send audio data when recording stops
            mediaRecorderRef.current.onstop = async () => {
                // This is a placeholder for sending the final blob.
                // For a more robust solution, you'd collect chunks and send the final blob.
            };

            // This sends data periodically. For a turn-based approach, you'd
            // ideally send the complete recording when the user stops talking.
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(event.data);
                }
            };

            connectSocket();
            setIsAwaitingFileUpload(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            setStatus('Error: Mic required');
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        
        setStatus('Uploading...');
        try {
            const response = await fetch(`http://localhost:8000/upload-resume/${CLIENT_ID}`, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                console.log('File uploaded successfully');
                setIsAwaitingFileUpload(false);
            } else {
                console.error('File upload failed');
                setStatus('Error: Upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setStatus('Error: Upload failed');
        }
    };

    const endInterview = () => {
        stopRecording();
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.close();
        }
        setStatus('Finished');
    };

    return { status, isAwaitingFileUpload, startInterview, endInterview, handleFileUpload };
};