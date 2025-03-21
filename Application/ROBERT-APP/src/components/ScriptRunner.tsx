import { useState } from 'react';
import PlayButton from './PlayButton';
import UploadFile from './UploadFile';

const ScriptRunner = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleRunScript = () => {
    console.log('Running script...');
  };

  const onFileUpload = (file: File | null): void => {
    console.log('File uploaded:', file);
    setFile(file); 
  };

  return (
    <div className="flex items-start justify-center gap-4">

      <UploadFile onFileUpload={onFileUpload} file={file}/>
      <PlayButton disabled={false} onClick={handleRunScript} />
    </div>
  );
};

export default ScriptRunner;
