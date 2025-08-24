// src/hooks/useInterviewSocket.js

import { useState, useRef, useCallback } from 'react';

const CLIENT_ID = `web_${Date.now()}`;
// Tunable constants for voice detection
const SILENCE_THRESHOLD_MS = 2000; // Will stop recording after 2 seconds of silence
const VOICE_THRESHOLD = 132; // A value from 0-255. 128 is pure silence. This detects very faint speech.

export const useInterviewSocket = () => {
    const [interviewState, setInterviewState] = useState('SETUP');
    const [status, setStatus] = useState('Idle');
    const [transcript, setTranscript] = useState([]);
    const [currentViseme, setCurrentViseme] = useState('sil');

    // Refs
    const socketRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioPlayerRef = useRef(new Audio());
    const audioChunksRef = useRef([]);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const voiceActivityTimerRef = useRef(null);
    const animationFrameRef = useRef(null);
    const isSpeakingRef = useRef(false);
    const audioQueue = useRef([]);
    const isPlaying = useRef(false);
    const visemeQueue = useRef([]);

    // --- THE FIX IS HERE ---
    // Reordered function definitions to respect dependency chain.
    // Functions are now defined BEFORE they are used in other callbacks.

    const stopRecordingAndSend = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
            console.log("VAD: Silence confirmed. Stopping recording.");
            mediaRecorderRef.current.stop();
            setStatus('Processing...');
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        }
    }, []);

    const detectVoice = useCallback(() => {
        const analyser = analyserRef.current;
        if (!analyser || mediaRecorderRef.current?.state !== 'recording') {
            return;
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);

        let hasVoice = false;
        for (let i = 0; i < dataArray.length; i++) {
            if (Math.abs(dataArray[i] - 128) > (VOICE_THRESHOLD - 128)) {
                hasVoice = true;
                break;
            }
        }

        if (hasVoice) {
            if (!isSpeakingRef.current) {
                isSpeakingRef.current = true;
            }
            clearTimeout(voiceActivityTimerRef.current);
        } else {
            if (isSpeakingRef.current) {
                isSpeakingRef.current = false;
                voiceActivityTimerRef.current = setTimeout(stopRecordingAndSend, SILENCE_THRESHOLD_MS);
            }
        }

        animationFrameRef.current = requestAnimationFrame(detectVoice);
    }, [stopRecordingAndSend]);

    const startRecording = useCallback(() => {
        if (mediaRecorderRef.current?.state === 'inactive') {
            audioChunksRef.current = [];
            mediaRecorderRef.current.start();
            setStatus('Recording...');
            animationFrameRef.current = requestAnimationFrame(detectVoice);
        }
    }, [detectVoice]);
    
    const processAudioQueue = useCallback(() => {
        if (isPlaying.current || audioQueue.current.length === 0) {
            return;
        }
        isPlaying.current = true;
        setStatus('Speaking...');
        
        const audioBlob = new Blob(audioQueue.current, { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play();
        
        audioQueue.current = [];

        audioPlayerRef.current.onended = () => {
            isPlaying.current = false;
            if (audioQueue.current.length > 0) {
                processAudioQueue();
            } else {
                setCurrentViseme('sil');
                startRecording();
            }
        };
    }, [startRecording]);
    
    const processVisemeQueue = useCallback(() => {
        if (visemeQueue.current.length > 0) {
            const { viseme, offset } = visemeQueue.current.shift();
            // Use a small adjustment to better sync visemes with buffered audio
            const adjustedOffset = Math.max(0, offset / 1000 * 950);
            setTimeout(() => {
                setCurrentViseme(viseme);
                processVisemeQueue();
            }, adjustedOffset);
        }
    }, []);

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
                audioQueue.current.push(event.data);
                if (!isPlaying.current) {
                    processAudioQueue();
                }
            } else {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'transcript') {
                        setTranscript(prev => [...prev, message.data]);
                    }
                    else if (message.type === 'viseme') {
                        const { viseme, offset } = message.data;
                        visemeQueue.current.push({ viseme, offset });
                        if (visemeQueue.current.length === 1) {
                            processVisemeQueue();
                        }
                    }
                } catch (e) { /* Ignore */ }
            }
        };
    }, [onSocketOpen, processAudioQueue, processVisemeQueue]);

    const startInterview = async (resumeFile, skills) => {
        setStatus('Setting up...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

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

    return { interviewState, status, transcript, startInterview, currentViseme };
};