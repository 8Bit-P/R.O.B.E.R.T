import { FaTrash } from 'react-icons/fa'; // Importing FaTrash icon from react-icons

interface DeleteButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ disabled = false, onClick }) => {
  return (
    <button
      className={`flex items-center self-start justify-center w-11 h-11 rounded border-2 cursor-pointer mx-auto transition
          ${disabled ? 'border-red-400 text-red-400 cursor-not-allowed' : 'border-red-500 text-red-500 hover:bg-red-100'}
        `}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {/* Trash icon using react-icons */}
      <FaTrash className="w-4.5 h-4.5" />
    </button>
  );
};

export default DeleteButton;
