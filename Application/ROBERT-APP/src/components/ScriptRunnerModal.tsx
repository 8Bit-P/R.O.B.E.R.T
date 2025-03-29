import React from 'react';
import Modal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import { AiOutlineClose } from 'react-icons/ai'; // Import close icon
import CodeViewer from './CodeViewer';

interface ScriptRunnerModalProps {
  modalIsOpen: boolean;
  afterOpenModal?: () => void;
  closeModal: () => void;
  file: File | null;
}

const customStyles: Modal.Styles = {
  overlay: {
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    position: 'relative',
    border: 'none',
    background: 'transparent',
    padding: 0,
    width: '90%',
    maxWidth: '600px',
    inset: 'unset',
    outline: 'none',
  },
};

const ScriptRunnerModal: React.FC<ScriptRunnerModalProps> = ({ modalIsOpen, afterOpenModal, closeModal, file }) => {
  return (
    <Modal
      isOpen={modalIsOpen}
      onAfterOpen={afterOpenModal}
      onRequestClose={() => {}} // Disable clicking outside to close
      style={customStyles}
      contentLabel="Script Runner Modal"
      shouldCloseOnOverlayClick={false} // Prevents closing on overlay click
      shouldCloseOnEsc={true} // Allow closing with ESC key
      ariaHideApp={false}
    >
      <AnimatePresence>
        {modalIsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }} // Closing animation
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-xl"
          >
            {/* Close Icon */}
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
              <AiOutlineClose size={24} />
            </button>

            {/* Title */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4" style={{ fontFamily: 'nothing' }}>Run Script</h2>

            <CodeViewer file={file} />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default ScriptRunnerModal;
