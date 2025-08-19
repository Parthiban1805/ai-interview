
import { useState, useRef, useCallback } from 'react';

const CLIENT_ID = `web_${Date.now()}`;
// Tunable constants for voice detection
const SILENCE_THRESHOLD_MS = 2000; // Will stop recording after 2 seconds of silence
const VOICE_THRESHOLD = 132; // A value from 0-255. 128 is pure silence. This detects very faint speech.

export const useInterviewSocket = () => {
    const [interviewState, setInterviewState] = useState('SETUP');
    const [status, setStatus] = useState('Idle');
    const [transcript, setTranscript] = useState([]);
    
    // Refs for WebSocket, MediaRecorder, and Audio
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());
    const audioChunksRef = useRef([]);

    // Refs for Voice Activity Detection (VAD)
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const voiceActivityTimerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isSpeakingRef = useRef(false);

    const stopRecordingAndSend = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            console.log("VAD: Silence confirmed. Stopping recording.");
            mediaRecorderRef.current.stop();
            setStatus('Processing...');
            // Stop the VAD loop
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
    }, []);

    // The new VAD function that runs on every animation frame
    const detectVoice = useCallback(() => {
        const analyser = analyserRef.current;
        if (!analyser || mediaRecorderRef.current?.state !== 'recording') {
            return;
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);

        // Check for any significant sound
        let hasVoice = false;
        for (let i = 0; i < dataArray.length; i++) {
            // The values are 0-255, with 128 being the center (silence).
            if (Math.abs(dataArray[i] - 128) > (VOICE_THRESHOLD - 128)) {
                hasVoice = true;
                break;
            }
        }

        if (hasVoice) {
            // User is speaking or there is noise
            if (!isSpeakingRef.current) {
                console.log("VAD: Voice started.");
                isSpeakingRef.current = true;
            }
            // Clear any existing silence timer
            clearTimeout(voiceActivityTimerRef.current);
        } else {
            // Silence is detected
            if (isSpeakingRef.current) {
                // This is the moment the user just stopped speaking
                console.log("VAD: Voice stopped, starting silence timer.");
                isSpeakingRef.current = false;
                // Start a timer to stop recording if silence persists
                voiceActivityTimerRef.current = setTimeout(stopRecordingAndSend, SILENCE_THRESHOLD_MS);
            }
        }

        // Continue the loop
        animationFrameRef.current = requestAnimationFrame(detectVoice);
    }, [stopRecordingAndSend]);

    const startRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'inactive') {
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setStatus('Recording...');
            console.log("VAD: Started recording and voice detection loop.");
            // Start the VAD loop
            animationFrameRef.current = requestAnimationFrame(detectVoice);
        }
    }, [detectVoice]);


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

        ws.onopen = () => {
            setStatus('Connected');
            onSocketOpen(resumeFile, skills);
        };
        
        ws.onclose = () => setInterviewState('FINISHED');
        ws.onerror = (err) => console.error('WebSocket Error:', err);

        ws.onmessage = async (event) => {
            if (event.data instanceof Blob) {
                setStatus('Speaking...');
                const audioUrl = URL.createObjectURL(event.data);
                audioPlayerRef.current.src = audioUrl;
                audioPlayerRef.current.play();
                audioPlayerRef.current.onended = () => {
                    startRecording();
                };
            } else {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'transcript') {
                        setTranscript(prev => [...prev, message.data]);
                    }
                } catch (e) { /* Ignore */ }
            }
        };
    }, [onSocketOpen, startRecording]);

    const startInterview = async (resumeFile, skills) => {
        setStatus('Setting up...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Setup Web Audio API for VAD
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            analyserRef.current = analyser;

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

    return { interviewState, status, transcript, startInterview };
};