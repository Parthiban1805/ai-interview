import React from 'react';
import { useInterviewSocket } from './hooks/useInterviewSocket';
import { SetupForm } from './components/SetupForm';
import VideoFeed from './components/VideoFeed';
import AIStatus from './components/AIStatus';
import Transcript from './components/Transcript';

// Enhanced AIAvatar component that reacts to the AI's status
const AIAvatar = ({ status }) => {
    const isSpeaking = status === 'Speaking...';
    const isThinking = status === 'Thinking...';

    return (
        <div className="relative w-full h-full max-w-[320px] max-h-[320px] aspect-square mx-auto">
            {/* Outer rings for animations */}
            <div className={`absolute inset-0 rounded-full transition-all duration-500
                ${isSpeaking ? 'bg-green-500/30 animate-pulse' : ''}
                ${isThinking ? 'bg-blue-500/20 animate-spin-slow' : ''}
            `}></div>
            <div className={`absolute inset-2 rounded-full transition-all duration-500
                ${isSpeaking ? 'bg-green-500/20 animate-pulse [animation-delay:150ms]' : ''}
                ${isThinking ? 'bg-blue-500/10 animate-spin-slow-reverse' : ''}
            `}></div>
            
            {/* Core Avatar */}
            <div className="absolute inset-4 w-auto h-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-4 border-gray-600 shadow-2xl">
                <div className="w-48 h-48 rounded-full bg-gradient-to-tl from-blue-500 to-purple-600"></div>
            </div>
        </div>
    );
};

// Polished SpeakControl
const SpeakControl = ({ status, onStartRecording, onStopRecording }) => {
    const isRecording = status === 'Recording...';
    const canSpeak = status === 'Listening...';

    const handleTouchStart = (e) => {
        e.preventDefault();
        if (canSpeak) onStartRecording();
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        if (isRecording) onStopRecording();
    };

    return (
        <button
            onMouseDown={onStartRecording}
            onMouseUp={onStopRecording}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            disabled={!canSpeak && !isRecording}
            className={`w-40 h-40 rounded-full transition-all duration-300 ease-in-out flex flex-col items-center justify-center text-center focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed
                ${isRecording ? 'bg-red-600 scale-110 shadow-2xl' : (canSpeak ? 'bg-blue-600 hover:bg-blue-700 shadow-lg' : 'bg-gray-600')}
            `}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-white/80" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A8.002 8.002 0 012 8V7a1 1 0 011-1h2a1 1 0 011 1v1a5 5 0 0010 0V7a1 1 0 011-1h2a1 1 0 011 1v1a8.002 8.002 0 01-5 7.93z" clipRule="evenodd" />
            </svg>
            <p className="text-white font-bold text-lg leading-tight">
                {isRecording ? 'Listening' : (canSpeak ? 'Hold to Speak' : 'Please Wait')}
            </p>
        </button>
    );
};

function App() {
  const { interviewState, status, transcript, startInterview, startRecording, stopRecordingAndSend } = useInterviewSocket();

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4 font-sans antialiased">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        
        {interviewState === 'SETUP' && (
          <div className="text-center transition-opacity duration-500">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              AI Mock Interviewer
            </h1>
            <p className="text-lg text-gray-400 mb-10">Get ready to ace your next technical interview.</p>
            <SetupForm onConfirm={startInterview} disabled={status === 'Setting up...'} />
          </div>
        )}

        {interviewState === 'INTERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[90vh]">
            {/* Left Column: Feeds */}
            <div className="flex flex-col items-center justify-around space-y-6">
              <div className="w-80 h-80">
                <AIAvatar status={status} />
              </div>
              <div className="w-80 h-80">
                <VideoFeed />
              </div>
            </div>

            {/* Right Column: Transcript & Controls */}
            <div className="flex flex-col bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
              <Transcript transcript={transcript} />
              <div className="p-4 border-t border-gray-700 flex flex-col items-center space-y-4">
                  <AIStatus status={status} />
                  <SpeakControl 
                      status={status}
                      onStartRecording={startRecording}
                      onStopRecording={stopRecordingAndSend}
                  />
              </div>
            </div>
          </div>
        )}

        {interviewState === 'FINISHED' && (
             <div className="text-center bg-gray-800 p-12 rounded-2xl shadow-xl transition-opacity duration-500">
                <h2 className="text-4xl font-bold text-green-400 mb-4">Interview Finished!</h2>
                <p className="text-lg text-gray-300">Great job! You can now close this window.</p>
                <p className="mt-8 text-sm text-gray-500">In a real application, you would get your feedback here.</p>
             </div>
        )}
      </div>
    </div>
  );
}

export default App;