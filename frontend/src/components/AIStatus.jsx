import React from 'react';

// Simple SVG icons for different states
const ThinkingIcon = () => (
    <svg className="animate-spin h-5 w-5 mr-3 text-blue-400" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const SpeakingIcon = () => (
    <div className="flex items-center justify-center mr-3 space-x-1">
        <span className="w-1 h-2 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '0s' }}></span>
        <span className="w-1 h-4 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></span>
        <span className="w-1 h-5 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-1 h-4 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></span>
        <span className="w-1 h-2 bg-green-400 rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></span>
    </div>
);

const ListeningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93V17h-2v-2.07A8.002 8.002 0 012 8V7a1 1 0 011-1h2a1 1 0 011 1v1a5 5 0 0010 0V7a1 1 0 011-1h2a1 1 0 011 1v1a8.002 8.002 0 01-5 7.93z" clipRule="evenodd" />
    </svg>
);

const AIStatus = ({ status }) => {
    let icon;
    let text;
    let textColor = "text-gray-300";

    switch (status) {
        case 'Thinking...':
            icon = <ThinkingIcon />;
            text = 'AI is thinking...';
            textColor = "text-blue-400";
            break;
        case 'Speaking...':
            icon = <SpeakingIcon />;
            text = 'AI is speaking...';
            textColor = "text-green-400";
            break;
        case 'Listening...':
            icon = <ListeningIcon />;
            text = 'Ready for your response.';
            break;
        case 'Recording...':
             icon = <div className="w-3 h-3 mr-3 bg-red-500 rounded-full animate-pulse"></div>;
             text = 'Recording your answer...';
             textColor = "text-red-400";
            break;
        default:
            icon = null;
            text = 'Initializing...';
    }

    return (
        <div className="w-full flex items-center justify-center p-4 rounded-lg bg-gray-800/70 border border-gray-700 min-h-[60px]">
            <div className={`flex items-center font-semibold text-lg ${textColor}`}>
                {icon}
                <span>{text}</span>
            </div>
        </div>
    );
};

export default AIStatus;