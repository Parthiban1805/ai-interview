import React from 'react';

const Controls = ({ onStart, onEnd, status }) => {
    const isInterviewActive = status !== 'Idle' && status !== 'Finished' && status !== 'Error' && status !== 'Connected';
  
    return (
      <div className="flex justify-center items-center space-x-4 mt-8">
        <button 
          onClick={onStart} 
          disabled={isInterviewActive || status === 'Connected'} // Disable once connected
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
        >
          Start Interview
        </button>
        <button 
          onClick={onEnd} 
          disabled={!isInterviewActive}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
        >
          End Interview
        </button>
      </div>
    );
  };
  
  export default Controls;