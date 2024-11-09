import { useEffect, useState } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import { ConnectionStates } from '../../constants/connectionConstants';

const Parameters = () => {
  const [acceleration, setAcceleration] = useState(50);
  const [velocity, setVelocity] = useState(50);

  const { isConnected, connectionState } = useConnection();

  //Initial animation
  useEffect(() => {
    // Only trigger the animation when a connection is made
    if (isConnected && connectionState === ConnectionStates.ACCEPTED_CONNECTION) {
      let tempVelocity = 50;
      let tempAcceleration = 50;

      // First animation: go from 50 to 100
      const upInterval = setInterval(() => {
        tempVelocity += 1;
        tempAcceleration += 1;

        setVelocity(tempVelocity);
        setAcceleration(tempAcceleration);

        // Once we reach 100, clear this interval and start the down animation
        if (tempVelocity >= 100 && tempAcceleration >= 100) {
          clearInterval(upInterval);

          // Second animation: go back to 50
          const downInterval = setInterval(() => {
            tempVelocity -= 1;
            tempAcceleration -= 1;

            setVelocity(tempVelocity);
            setAcceleration(tempAcceleration);

            // Once we reach 50, clear this interval and start the down-to-0 animation
            if (tempVelocity <= 50 && tempAcceleration <= 50) {
              clearInterval(downInterval);

              // Third animation: go down to 0
              const toZeroInterval = setInterval(() => {
                tempVelocity -= 1;
                tempAcceleration -= 1;

                setVelocity(tempVelocity);
                setAcceleration(tempAcceleration);

                // Once we reach 0, clear this interval and start the up-to-50 animation
                if (tempVelocity <= 0 && tempAcceleration <= 0) {
                  clearInterval(toZeroInterval);

                  // Final animation: go back up to 50
                  const toFiftyInterval = setInterval(() => {
                    tempVelocity += 1;
                    tempAcceleration += 1;

                    setVelocity(tempVelocity);
                    setAcceleration(tempAcceleration);

                    // Clear interval once we reach 50
                    if (tempVelocity >= 50 && tempAcceleration >= 50) {
                      clearInterval(toFiftyInterval);
                    }
                  }, 5); // Adjust speed as needed
                }
              }, 5); // Adjust speed as needed
            }
          }, 5); // Adjust speed as needed
        }
      }, 5); // Adjust speed as needed
    }
  }, [isConnected, connectionState]);

  return (
    <div style={{ fontFamily: 'nothing' }} className="space-y-4 p-4 pl-2">
      <div className="flex flex-col space-y-4">
        {/* Acceleration Slider */}
        <div className="flex items-center">
          <label className="w-28 font-semibold">Acceleration</label>
          <input
            type="range"
            min="0"
            max="100"
            value={acceleration}
            onChange={(e) => setAcceleration(Number(e.target.value))}
            className="w-[150px] h-1 ml-2 appearance-none bg-gray-300 bg-dotted-slider rounded-md"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #E5E7EB, #E5E7EB 2px, transparent 2px, transparent 5px)',
              outline: 'none',
            }}
          />
          <span className="ml-2 w-8 text-center">{acceleration}</span>
        </div>

        {/* Velocity Slider */}
        <div className="flex items-center">
          <label className="w-28 font-semibold">Velocity</label>
          <input
            type="range"
            min="0"
            max="100"
            value={velocity}
            onChange={(e) => setVelocity(Number(e.target.value))}
            className="w-[150px] h-1 ml-11 appearance-none bg-gray-300 bg-dotted-slider rounded-md"
            style={{
              backgroundImage:
                'repeating-linear-gradient(90deg, #E5E7EB, #E5E7EB 2px, transparent 2px, transparent 5px)',
              outline: 'none',
            }}
          />
          <span className="ml-2 w-8 text-center">{velocity}</span>
        </div>
      </div>
    </div>
  );
};

export default Parameters;
