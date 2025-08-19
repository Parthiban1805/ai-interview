import React, { useState, useRef } from 'react';

export const SetupForm = ({ onConfirm, disabled }) => {
    const [resumeFile, setResumeFile] = useState(null);
    const [skills, setSkills] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setResumeFile(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (resumeFile && skills.trim()) {
            onConfirm(resumeFile, skills);
        } else {
            alert('Please upload your resume and list the skills you want to be interviewed on.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl space-y-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-center text-gray-200">Interview Setup</h2>
            
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 text-left">
                    1. Upload Your Resume (.pdf, .docx)
                </label>
                <div 
                    onClick={() => fileInputRef.current.click()}
                    className="mt-1 flex justify-center px-6 py-8 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors"
                >
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-500" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                        <p className="text-sm text-blue-400 font-semibold">{resumeFile ? resumeFile.name : 'Click to select a file'}</p>
                        <p className="text-xs text-gray-500">PDF or DOCX, up to 10MB</p>
                    </div>
                </div>
                <input id="resume-upload" ref={fileInputRef} name="resume-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx" />
            </div>

            <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-400 text-left mb-2">
                    2. Skills to Focus On (comma-separated)
                </label>
                <input
                    type="text"
                    name="skills"
                    id="skills"
                    className="shadow-sm bg-gray-700 border-gray-600 text-white block w-full text-base rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Python, React, SQL, AWS"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                />
            </div>

            <button
                type="submit"
                disabled={disabled || !resumeFile || !skills.trim()}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {disabled ? 'Starting...' : 'Start Interview'}
            </button>
        </form>
    );
};