import React, { useRef } from 'react';

const FileUpload = ({ onFileSelect, disabled }) => {
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            onFileSelect(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
            <p className="text-gray-400 mb-4">Please upload your resume to begin the interview.</p>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.docx"
                disabled={disabled}
            />
            <button
                onClick={handleClick}
                disabled={disabled}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Select File
            </button>
        </div>
    );
};

export default FileUpload;