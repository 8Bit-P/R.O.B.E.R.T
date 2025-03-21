interface PlayButtonProps {
  disabled?: boolean;
  onClick?: () => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ disabled = false, onClick }) => {
  return (
    <button
      className={`flex items-center justify-center w-11 h-11 rounded cursor-pointer mx-auto transition 
          ${disabled ? 'bg-red-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'}
        `}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-white" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
};

export default PlayButton;
