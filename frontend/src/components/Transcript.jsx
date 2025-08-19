import React, { useRef, useEffect } from 'react';

const Transcript = ({ transcript }) => {
  const transcriptEndRef = useRef(null);

  // Automatically scroll to the bottom of the transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="flex-grow p-4 sm:p-6 space-y-4 overflow-y-auto">
      {transcript.map((line, index) => {
        const isUser = line.startsWith('You:');
        return (
          <div key={index} className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${isUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
              <p className="text-white">{line.substring(line.indexOf(':') + 1).trim()}</p>
            </div>
          </div>
        );
      })}
      <div ref={transcriptEndRef} />
    </div>
  );
};

export default Transcript;