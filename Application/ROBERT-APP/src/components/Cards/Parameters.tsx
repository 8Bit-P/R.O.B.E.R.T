import { useState } from 'react';

const Parameters = () => {
  const [acceleration, setAcceleration] = useState(50);
  const [velocity, setVelocity] = useState(50);

  return (
    <div style={{ fontFamily: 'nothing' }} className="space-y-4 p-4 pl-2">
      <div className="flex flex-col space-y-4">
        {/* Acceleration Slider */}
        <div className="flex items-center">
          <label className="w-28 font-semibold">Acceleration</label> {/* Fixed width */}
          <input
            type="range"
            min="0"
            max="100"
            value={acceleration}
            onChange={(e) => setAcceleration(Number(e.target.value))}
            className="w-[150px] h-1 ml-2 appearance-none bg-gray-300 bg-dotted-slider rounded-md"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #E5E7EB, #E5E7EB 2px, transparent 2px, transparent 5px)',
              outline: 'none',
            }}
          />
          <span className="ml-2 w-8 text-center">{acceleration}</span> {/* Fixed width for consistency */}
        </div>
        
        {/* Velocity Slider */}
        <div className="flex items-center">
          <label className="w-28 font-semibold">Velocity</label> {/* Same fixed width */}
          <input
            type="range"
            min="0"
            max="100"
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
            className="w-[150px] h-1 ml-11 appearance-none bg-gray-300 bg-dotted-slider rounded-md"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #E5E7EB, #E5E7EB 2px, transparent 2px, transparent 5px)',
              outline: 'none',
            }}
          />
          <span className="ml-2 w-8 text-center">{velocity}</span> {/* Fixed width for consistency */}
        </div>
      </div>
    </div>
  );
};

export default Parameters;
