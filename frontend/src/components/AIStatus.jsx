import React from 'react';

const AIStatus = ({ status }) => {
  let statusText = status;
  let statusColor = 'text-gray-400';
  let pulse = false;

  switch (status) {
    case 'Listening...':
      statusText = 'Listening... Speak now.';
      statusColor = 'text-green-400';
      pulse = true;
      break;
    case 'AI Speaking...':
      statusColor = 'text-blue-400';
      break;
    case 'AI Processing...':
    case 'Uploading...':
      statusText = 'Thinking...';
      statusColor = 'text-yellow-400';
      pulse = true;
      break;
    case 'Connected':
        statusText = 'Ready to Start';
        break;
  }

  return (
    <div className="text-center my-4">
      <p className={`text-2xl font-semibold transition-colors duration-300 ${statusColor} ${pulse ? 'animate-pulse' : ''}`}>
        {statusText}
      </p>
    </div>
  );
};

export default AIStatus;