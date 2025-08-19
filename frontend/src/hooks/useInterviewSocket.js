import { useState, useRef, useCallback } from 'react';

const CLIENT_ID = `web_${Date.now()}`;

export const useInterviewSocket = () => {
    const [interviewState, setInterviewState] = useState('SETUP');
    const [status, setStatus] = useState('Idle');
    const [transcript, setTranscript] = useState([]);
    
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());
    const audioChunksRef = useRef([]);

    // This function will be called once the WebSocket is open
    const onSocketOpen = useCallback(async (resumeFile, skills) => {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('skills', skills);
        
        try {
            const response = await fetch(`http://localhost:8000/setup-interview/${CLIENT_ID}`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.status === 'success') {
                setInterviewState('INTERVIEW');
            } else {
                alert(`Setup failed: ${result.message}`);
                setStatus('Idle');
                socketRef.current?.close();
            }
        } catch (error) {
            console.error('Error setting up interview:', error);
            setStatus('Error');
        }
    }, []);

    const connect = useCallback((resumeFile, skills) => {
        if (socketRef.current) return;
        
        setStatus('Connecting...');
        const ws = new WebSocket(`ws://localhost:8000/ws/${CLIENT_ID}`);
        socketRef.current = ws;

        // The key change: We call onSocketOpen from within the onopen handler
        ws.onopen = () => {
            setStatus('Connected');
            onSocketOpen(resumeFile, skills);
        };
        
        ws.onclose = () => setInterviewState('FINISHED');
        ws.onerror = (err) => console.error('WebSocket Error:', err);

        ws.onmessage = async (event) => {
            if (event.data instanceof Blob) {
                setStatus('AI Speaking...');
                const audioUrl = URL.createObjectURL(event.data);
                audioPlayerRef.current.src = audioUrl;
                audioPlayerRef.current.play();
                audioPlayerRef.current.onended = () => setStatus('Listening...');
            } else {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'transcript') {
                        setTranscript(prev => [...prev, message.data]);
                    }
                } catch (e) {
                    // Ignore
                }
            }
        };
    }, [onSocketOpen]);

    const startRecording = () => {
        if (mediaRecorderRef.current?.state === 'inactive') {
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setStatus('Recording...');
        }
    };

    const stopRecordingAndSend = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop(); 
            setStatus('Processing...');
        }
    };

    const startInterview = async (resumeFile, skills) => {
        setStatus('Setting up...');
        try {
            // THE CRITICAL FIX: Setup and attach event listeners BEFORE connecting
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            
            recorder.onstop = () => {
                if (audioChunksRef.current.length === 0) {
                    setStatus('Listening...');
                    return;
                }
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (socketRef.current?.readyState === WebSocket.OPEN) {
                    socketRef.current.send(audioBlob);
                }
                audioChunksRef.current = [];
            };

            mediaRecorderRef.current = recorder;
            connect(resumeFile, skills);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            setStatus('Error: Mic required');
            alert('Microphone access is required to start the interview.');
        }
    };

    return { interviewState, status, transcript, startInterview, startRecording, stopRecordingAndSend };
};