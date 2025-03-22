import React from "react";
import Modal from "react-modal";
import { motion, AnimatePresence } from "framer-motion";

interface ScriptRunnerModalProps {
  modalIsOpen: boolean;
  afterOpenModal?: () => void;
  closeModal: () => void;
}

const customStyles: Modal.Styles = {
  overlay: {
    backgroundColor: "transparent", // No backdrop
  },
  content: {
    inset: "unset", // Remove default positioning
    border: "none", // We'll handle borders with Tailwind
    background: "transparent", // Needed for animation
    padding: 0, // Remove default padding
  },
};

const ScriptRunnerModal: React.FC<ScriptRunnerModalProps> = ({
  modalIsOpen,
  afterOpenModal,
  closeModal,
}) => {
  return (
    <Modal
      isOpen={modalIsOpen}
      onAfterOpen={afterOpenModal}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Script Runner Modal"
      ariaHideApp={false} // Remove warnings when testing
    >
      <AnimatePresence>
        {modalIsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 bg-white border-2 border-blue-500 rounded-lg p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-gray-800">Run Script</h2>

            <form className="w-full mt-4 space-y-3">
              <input
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter script name"
              />
              <div className="flex justify-between">
                <button className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100">
                  Tab Navigation
                </button>
                <button className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100">
                  Stays
                </button>
                <button className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-100">
                  Inside
                </button>
              </div>
            </form>

            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default ScriptRunnerModal;
