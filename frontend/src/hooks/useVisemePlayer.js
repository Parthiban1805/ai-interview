// src/hooks/useVisemePlayer.js
import { useState, useRef, useCallback } from 'react';

// Create a single AudioContext for the entire application
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

export const useVisemePlayer = () => {
  const [currentViseme, setCurrentViseme] = useState('sil'); // 'sil' is silence
  const audioQueue = useRef([]);
  const isPlaying = useRef(false);
  const audioPlaybackTime = useRef(0);

  // This is the new, robust MP3 decoding and playback function
  const processAudioQueue = useCallback(async () => {
    if (isPlaying.current || audioQueue.current.length === 0) {
      return;
    }

    isPlaying.current = true;

    // Grab all the chunks currently in the queue
    const chunksToProcess = audioQueue.current.splice(0, audioQueue.current.length);
    const blob = new Blob(chunksToProcess, { type: 'audio/mpeg' });
    const arrayBuffer = await blob.arrayBuffer();

    // The browser's native decoder is the most reliable way to handle MP3 data
    audioContext.decodeAudioData(
      arrayBuffer,
      (decodedBuffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = decodedBuffer;
        source.connect(audioContext.destination);

        const startTime = audioPlaybackTime.current < audioContext.currentTime 
          ? audioContext.currentTime 
          : audioPlaybackTime.current;
      
        source.start(startTime);

        const duration = decodedBuffer.duration;
        audioPlaybackTime.current = startTime + duration;

        source.onended = () => {
          isPlaying.current = false;
          // After this chunk finishes, immediately check if more have arrived
          processAudioQueue();
        };
      },
      (error) => {
        console.error("Error decoding audio data:", error);
        isPlaying.current = false;
      }
    );
  }, []);
  
  // This function is now simpler. It just adds the raw ArrayBuffer to the queue.
  const addAudioChunk = useCallback((chunk) => {
    audioQueue.current.push(chunk);
    processAudioQueue();
  }, [processAudioQueue]);

  const handleViseme = useCallback((visemes) => {
    // Schedule viseme changes based on accurate audio playback time
    let playbackTime = audioPlaybackTime.current;
    if (playbackTime < audioContext.currentTime) {
      playbackTime = audioContext.currentTime;
    }

    visemes.forEach(({ time, value }) => {
      const delay = (playbackTime - audioContext.currentTime + time) * 1000;
      setTimeout(() => {
        setCurrentViseme(value);
      }, Math.max(0, delay)); // Ensure delay is not negative
    });
  }, []);

  return { addAudioChunk, handleViseme, currentViseme };
};