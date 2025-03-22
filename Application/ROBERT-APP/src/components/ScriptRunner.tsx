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
    <div className="flex justify-between items-start w-full gap-8 h-[70px]">

      <UploadFile onFileUpload={onFileUpload} file={file}/>
      {/* TODO: disable based on isConnected */}
      <PlayButton disabled={false} onClick={handleRunScript} />
    </div>
  );
};

export default ScriptRunner;
