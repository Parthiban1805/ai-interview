import React, { useRef, useEffect } from 'react';

const Transcript = ({ transcript }) => {
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="flex-grow overflow-y-auto p-4 bg-gray-900/50 rounded-lg space-y-4">
      {transcript.map((line, index) => {
        const isUser = line.startsWith('You:');
        return (
          <p key={index} className={`max-w-[85%] p-3 rounded-lg ${isUser ? 'bg-blue-600 ml-auto' : 'bg-gray-700 mr-auto'}`}>
            {line}
          </p>
        );
      })}
      <div ref={transcriptEndRef} />
    </div>
  );
};

export default Transcript;