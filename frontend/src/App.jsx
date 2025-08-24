import React, { useState, useEffect } from 'react';
import { useInterviewSocket } from './hooks/useInterviewSocket';
import { SetupForm } from './components/SetupForm';
import VideoFeed from './components/VideoFeed';
import AIStatus from './components/AIStatus';
import Transcript from './components/Transcript';
import AIAvatar3D from './components/AIAvatar3D';

function App() {
  const { interviewState, status, transcript, startInterview, currentViseme, mediaStream } = useInterviewSocket();
  const [layoutMode, setLayoutMode] = useState('professional'); // 'professional' or 'split'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-hide cursor during interview for immersive experience
  useEffect(() => {
    let timer;
    if (interviewState === 'INTERVIEW') {
      const handleMouseMove = () => {
        document.body.style.cursor = 'default';
        clearTimeout(timer);
        timer = setTimeout(() => {
          document.body.style.cursor = 'none';
        }, 3000);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.body.style.cursor = 'default';
        clearTimeout(timer);
      };
    }
  }, [interviewState]);

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'professional' ? 'split' : 'professional');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white min-h-screen flex flex-col items-center justify-center font-sans antialiased relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-purple-400/30 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-blue-300/10 rounded-full animate-bounce"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 relative z-10">
        
        {/* Setup Phase */}
        {interviewState === 'SETUP' && (
          <div className="text-center transition-all duration-700 ease-in-out transform">
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 leading-tight">
                AI Mock Interviewer
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mb-8 rounded-full"></div>
              <p className="text-xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
                Experience the future of interview preparation with our advanced AI interviewer
              </p>
              <p className="text-sm text-gray-500 mb-12">
                Powered by real-time AI analysis and 3D avatar technology
              </p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl max-w-md mx-auto">
              <SetupForm onConfirm={startInterview} disabled={status === 'Setting up...'} />
              
              {status === 'Setting up...' && (
                <div className="mt-6 flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span className="text-sm text-gray-400">Initializing AI systems...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interview Phase */}
        {interviewState === 'INTERVIEW' && (
          <div className="h-screen max-h-screen flex flex-col relative">
            
            {/* Control Bar */}
            <div className="absolute top-4 right-4 z-20 flex items-center space-x-2">
              <button
                onClick={toggleLayout}
                className="bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:border-white/40"
                title="Toggle Layout"
              >
                {layoutMode === 'professional' ? '⊞' : '⊟'}
              </button>
              <button
                onClick={toggleFullscreen}
                className="bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:border-white/40"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? '⤓' : '⤢'}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm border border-white/20 transition-all duration-200 hover:border-white/40"
                title="Settings"
              >
                ⚙
              </button>
            </div>

            {/* Professional Video Call Layout */}
            {layoutMode === 'professional' && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
                
                {/* Main Avatar Area */}
                <div className="lg:col-span-3 relative">
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-600/50 shadow-2xl overflow-hidden relative backdrop-blur-sm">
                    <AIAvatar3D status={status} currentViseme={currentViseme} />
                    
                    {/* Professional Header */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 via-black/20 to-transparent p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            status === 'Speaking...' ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' :
                            status === 'Recording...' ? 'bg-red-400 animate-pulse shadow-lg shadow-red-400/50' :
                            status === 'Thinking...' || status === 'Processing...' ? 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50' :
                            'bg-gray-400'
                          }`}></div>
                          <span className="text-white font-semibold text-lg">AI Interviewer</span>
                          <span className="text-sm text-white/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
                            {status}
                          </span>
                        </div>
                        
                        <div className="text-white/70 text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                          Live Interview Session
                        </div>
                      </div>
                    </div>
                    
                    {/* User Video - Picture-in-Picture */}
                    <div className="absolute bottom-6 right-6 w-56 h-42 rounded-xl overflow-hidden border-2 border-white/30 shadow-2xl bg-gray-800/80 backdrop-blur-sm transition-all duration-300 hover:border-white/50">
                      <div className="w-full h-full relative">
                        <VideoFeed  stream={mediaStream}/>
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700/60 to-gray-800/60 text-white text-sm backdrop-blur-sm">
                          <div className="text-center">
                            <div className="w-10 h-10 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center text-lg backdrop-blur-sm">
                              👤
                            </div>
                            <div className="font-medium">Your Camera</div>
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3">
                        <div className="text-white text-sm font-semibold">You</div>
                      </div>
                    </div>

                    {/* Audio Visualizer */}
                    {(status === 'Speaking...' || status === 'Recording...') && (
                      <div className="absolute bottom-6 left-6 flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 bg-gradient-to-t ${
                              status === 'Speaking...' 
                                ? 'from-green-400 to-green-300' 
                                : 'from-red-400 to-red-300'
                            } rounded-full animate-pulse`}
                            style={{
                              height: `${Math.random() * 20 + 8}px`,
                              animationDelay: `${i * 0.1}s`
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Side Panel */}
                <div className="lg:col-span-1 flex flex-col space-y-4">
                  <div className="flex-1 bg-slate-800/60 rounded-xl border border-slate-600/50 shadow-xl backdrop-blur-sm overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-slate-700/60 to-slate-600/60 border-b border-slate-600/50 backdrop-blur-sm">
                      <h3 className="text-white font-bold text-sm flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                        Live Transcript
                      </h3>
                    </div>
                    <div className="h-full overflow-hidden">
                      <Transcript transcript={transcript} />
                    </div>
                  </div>
                  
                  <div className="bg-slate-800/60 rounded-xl border border-slate-600/50 shadow-xl backdrop-blur-sm p-4">
                    <AIStatus status={status} />
                  </div>
                </div>
              </div>
            )}

            {/* Split Screen Layout */}
            {layoutMode === 'split' && (
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                
                {/* Left: Avatar */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-full max-w-sm aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-600/50 shadow-2xl overflow-hidden backdrop-blur-sm">
                    <AIAvatar3D status={status} currentViseme={currentViseme} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-1">AI Interviewer</h3>
                    <p className="text-sm text-gray-400">{status}</p>
                  </div>
                </div>

                {/* Center: User Video */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-full max-w-sm aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl border border-gray-600/50 shadow-2xl overflow-hidden backdrop-blur-sm">
                    <VideoFeed  stream={mediaStream}/>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white mb-1">You</h3>
                    <p className="text-sm text-gray-400">Interviewee</p>
                  </div>
                </div>

                {/* Right: Transcript */}
                <div className="flex flex-col space-y-4">
                  <div className="flex-1 bg-slate-800/60 rounded-2xl border border-slate-600/50 shadow-xl backdrop-blur-sm overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-slate-700/60 to-slate-600/60 border-b border-slate-600/50">
                      <h3 className="text-white font-bold">Interview Transcript</h3>
                    </div>
                    <Transcript transcript={transcript} />
                  </div>
                  
                  <div className="bg-slate-800/60 rounded-2xl border border-slate-600/50 shadow-xl backdrop-blur-sm p-4">
                    <AIStatus status={status} />
                  </div>
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showSettings && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-600 shadow-2xl max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">Settings</h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Layout Mode
                      </label>
                      <select
                        value={layoutMode}
                        onChange={(e) => setLayoutMode(e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="professional">Professional Video Call</option>
                        <option value="split">Split Screen</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Fullscreen Mode</span>
                      <button
                        onClick={toggleFullscreen}
                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                          isFullscreen 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                        }`}
                      >
                        {isFullscreen ? 'Exit' : 'Enter'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Finished Phase */}
        {interviewState === 'FINISHED' && (
           <div className="text-center bg-gradient-to-br from-gray-800 to-slate-800 p-16 rounded-3xl shadow-2xl border border-gray-700/50 backdrop-blur-xl transition-all duration-700 transform">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl">
                  ✓
                </div>
                <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500 mb-6">
                  Interview Complete!
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto mb-8 rounded-full"></div>
              </div>
              
              <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto leading-relaxed">
                Congratulations! You've successfully completed your AI mock interview session.
              </p>
              
              <div className="bg-slate-700/50 rounded-2xl p-6 border border-slate-600/50 max-w-lg mx-auto">
                <p className="text-sm text-gray-400 mb-4">
                  In a production environment, you would receive:
                </p>
                <ul className="text-sm text-gray-300 space-y-2 text-left">
                  <li>• Detailed performance analysis</li>
                  <li>• Personalized feedback and recommendations</li>
                  <li>• Score breakdown by category</li>
                  <li>• Suggested areas for improvement</li>
                </ul>
              </div>
              
              <button className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Start New Interview
              </button>
           </div>
        )}
      </div>
    </div>
  );
}

export default App;