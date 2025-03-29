import React, { useState } from 'react';

interface UploadFileProps {
  onFileUpload: (file: File | null) => void; // This is the function to send file to the parent component
  file: File | null; // This is the file state from the parent component
}

const UploadFile: React.FC<UploadFileProps> = ({ onFileUpload,file }) => {
  const [error, setError] = useState<string>(''); // New state to track error messages

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
  
    if (selectedFile && selectedFile.name.endsWith('.rob')) {
      setError('');
      onFileUpload(selectedFile);
      event.target.value = ''; // Reset input value to allow re-upload of the same file
    } else {
      setError('Please upload a .rob file');
      onFileUpload(null);
      event.target.value = ''; // Reset input value to clear previous selection
    }
  };
  

  const handleRemoveFile = () => {
    setError(''); // Reset error message
    onFileUpload(null); // Notify parent component to remove file
  };

  return (
    <div className="flex flex-col items-center gap-1 flex-1 w-max">
      <label
        htmlFor="uploadFile1"
        className={`flex bg-gray-600 hover:bg-gray-700 text-white text-base font-medium px-4 py-2.5 outline-none rounded-md w-full cursor-pointer ${
          file ? 'hidden' : ''
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 mr-4 fill-white inline" viewBox="0 0 32 32">
          <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z" />
          <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z" />
        </svg>
        Upload File
        <input
          type="file"
          id="uploadFile1"
          className="hidden"
          onChange={handleFileChange}
          accept=".rob" // Accept only .rob files
        />
      </label>

      {file ? (
        <div className="flex items-center justify-between w-full max-w-[200px] mt-2">
          <p className="text-gray-500 text-md truncate overflow-hidden whitespace-nowrap max-w-[150px]">{file.name}</p>
          <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-700 text-xl" aria-label="Remove file">
            ✖
          </button>
        </div>
      ) : (
        <p className={`text-sm ${error ? 'text-red-500' : 'text-gray-500'} mr-4`}>{error || 'Please upload a .rob file'}</p>
      )}
    </div>
  );
};

export default UploadFile;
