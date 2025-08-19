
import React from 'react';
import { useInterviewSocket } from './hooks/useInterviewSocket';
import { SetupForm } from './components/SetupForm';
import VideoFeed from './components/VideoFeed';
import AIStatus from './components/AIStatus';
import Transcript from './components/Transcript';

// Enhanced AIAvatar component that reacts to the AI's status
const AIAvatar = ({ status }) => {
    const isSpeaking = status === 'Speaking...';
    // THE FIX IS HERE: Added 'Processing...' to the thinking state
    const isThinking = status === 'Thinking...' || status === 'Processing...';
    const isRecording = status === 'Recording...';

    return (
        <div className="relative w-full h-full max-w-[320px] max-h-[320px] aspect-square mx-auto">
            {/* Outer rings for animations */}
            <div className={`absolute inset-0 rounded-full transition-all duration-500
                ${isSpeaking ? 'bg-green-500/30 animate-pulse' : ''}
                ${isThinking ? 'bg-blue-500/20 animate-spin-slow' : ''}
                ${isRecording ? 'bg-red-500/20 animate-pulse' : ''}
            `}></div>
            <div className={`absolute inset-2 rounded-full transition-all duration-500
                ${isSpeaking ? 'bg-green-500/20 animate-pulse [animation-delay:150ms]' : ''}
                ${isThinking ? 'bg-blue-500/10 animate-spin-slow-reverse' : ''}
                 ${isRecording ? 'bg-red-500/10 animate-pulse [animation-delay:150ms]' : ''}
            `}></div>
            
            {/* Core Avatar */}
            <div className="absolute inset-4 w-auto h-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-4 border-gray-600 shadow-2xl">
                <div className="w-48 h-48 rounded-full bg-gradient-to-tl from-blue-500 to-purple-600"></div>
            </div>
        </div>
    );
};

function App() {
  const { interviewState, status, transcript, startInterview } = useInterviewSocket();

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
              <div className="p-4 border-t border-gray-700 flex flex-col items-center justify-center h-28">
                  <AIStatus status={status} />
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