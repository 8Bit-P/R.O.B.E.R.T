interface CardProps {
    width: number;
    height: number;
    title: string;
    children: React.ReactNode; // Add children prop
}

const Card = ({ width, height, title, children }: CardProps) => {
    return (
        <div
            style={{ width: `${width}px`, height: `${height}px` }}
            className="bg-zinc-100 rounded-3xl flex flex-col text-left m-2"
        >
            <div className="font-bold pl-4 pr-2 pt-2 pb-1.5">{title}</div>
            <div className="flex-grow border-t-2 p-2">
                {children} {/* Render children here */}
            </div>
        </div>
    );
};

export default Card;
