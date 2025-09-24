interface CardProps {
  width: number;
  height: number;
  title: string;
  dark?: boolean;
  children: React.ReactNode;
}

const Card = ({ width, height, title, dark, children }: CardProps) => {
  // Conditional classes based on dark mode
  const containerClass = dark
    ? "bg-gray-800 text-white"
    : "bg-zinc-100 text-black";

  const borderClass = dark
    ? "border-gray-700"
    : "border-zinc-300";

  return (
    <div
      style={{ width: `${width}px`, height: `${height}px` }}
      className={`rounded-3xl flex flex-col text-left ${containerClass}`}
    >
      <div className="font-bold pl-4 pr-2 pt-2 pb-1.5 select-none">{title}</div>
      <div className={`flex-grow border-t-2 p-2 ${borderClass}`}>
        {children}
      </div>
    </div>
  );
};

export default Card;
