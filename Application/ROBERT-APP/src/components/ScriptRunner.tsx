import { useState } from 'react';
import PlayButton from './PlayButton';
import UploadFile from './UploadFile';

import toast from 'react-hot-toast';
import { useConnection } from '../context/ConnectionContext';
import ScriptRunnerModal from './ScriptRunnerModal';

const ScriptRunner = () => {
  const { isConnected } = useConnection();

  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }

  const handleRunScript = () => {
    if (!file) {
      toast.error('Please upload a script file');
      return;
    }
    setIsModalOpen(true);
  };

  const onFileUpload = (file: File | null): void => {
    setFile(file);
  };

  return (
    <>
      <ScriptRunnerModal modalIsOpen={isModalOpen} closeModal={handleCloseModal} file={file}/>
      <div className="flex justify-between items-start w-full gap-8 h-[70px]">
        <UploadFile onFileUpload={onFileUpload} file={file} />
        {/* TODO: disable based on isConnected */}
        <PlayButton disabled={false} onClick={handleRunScript} />
      </div>
    </>
  );
};

export default ScriptRunner;
