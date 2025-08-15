import React from 'react';
import { useInterviewSocket } from './hooks/useInterviewSocket';
import VideoFeed from './components/VideoFeed';
import AIStatus from './components/AIStatus';
import Controls from './components/Controls';
import FileUpload from './components/FileUpload';

// A simple component for the AI's avatar
const AIAvatar = () => (
    <div className="w-80 h-80 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center border-4 border-gray-600">
        <div className="w-48 h-48 rounded-full bg-gradient-to-tl from-blue-500 to-purple-600 shadow-2xl"></div>
    </div>
);

function App() {
  const { status, isAwaitingFileUpload, startInterview, endInterview, handleFileUpload } = useInterviewSocket();

  const isInterviewActive = status !== 'Idle' && status !== 'Finished' && status !== 'Error' && status !== 'Connected';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-4">AI Mock Interview</h1>
      <p className="text-gray-400 mb-8">Practice your skills with Alex, your AI interviewer.</p>
      
      <div className="w-full max-w-6xl p-8 bg-gray-800/50 rounded-2xl shadow-2xl">
        
        {isInterviewActive ? (
          // Main Interview View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col items-center justify-center space-y-6">
                <AIAvatar />
            </div>
            <div className="flex flex-col items-center justify-center space-y-6">
                <VideoFeed />
            </div>
            <div className="md:col-span-2">
                <AIStatus status={status} />
            </div>
          </div>
        ) : (
          // Initial/Welcome View
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-6">Welcome!</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
                Click "Start Interview" to connect and grant microphone access. You will then be prompted to upload your resume to begin.
            </p>
          </div>
        )}

        {isAwaitingFileUpload && (
            <div className="mt-8 max-w-lg mx-auto">
                <FileUpload onFileSelect={handleFileUpload} disabled={status === 'Uploading...'} />
            </div>
        )}

        <Controls 
            onStart={startInterview} 
            onEnd={endInterview} 
            status={status} 
        />
        
        {status === 'Finished' && (
             <p className="text-center text-green-400 font-semibold mt-6 text-xl">Interview session ended. Great job!</p>
        )}
         {status === 'Error' && (
             <p className="text-center text-red-40á00 font-semibold mt-6 text-xl">A connection error occurred. Please refresh and try again.</p>
        )}
      </div>
    </div>
  );
}

export default App;