import { useEffect, useState } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import { ConnectionStates } from '../../constants/connectionConstants';
import { setAcceleration as setAPIacceleration, setVelocity as setAPIVelocity } from "../../api/commands";

const Parameters = () => {
  const [acceleration, setAcceleration] = useState(50);
  const [velocity, setVelocity] = useState(50);

  const [isAnimating, setIsAnimating] = useState(false);

  const { port, isConnected, connectionState } = useConnection();

  // State to track the timeout for debouncing
  const [accelerationTimeout, setAccelerationTimeout] = useState<number | null>(null);
  const [velocityTimeout, setVelocityTimeout] = useState<number| null>(null);

  // Initial animation
  useEffect(() => {
    if (isConnected && connectionState === ConnectionStates.ACCEPTED_CONNECTION) {
      setIsAnimating(true);

      let tempVelocity = 50;
      let tempAcceleration = 50;

      const upInterval = setInterval(() => {
        tempVelocity += 1;
        tempAcceleration += 1;

        setVelocity(tempVelocity);
        setAcceleration(tempAcceleration);

        if (tempVelocity >= 100 && tempAcceleration >= 100) {
          clearInterval(upInterval);

          const downInterval = setInterval(() => {
            tempVelocity -= 1;
            tempAcceleration -= 1;

            setVelocity(tempVelocity);
            setAcceleration(tempAcceleration);

            if (tempVelocity <= 50 && tempAcceleration <= 50) {
              clearInterval(downInterval);

              const toZeroInterval = setInterval(() => {
                tempVelocity -= 1;
                tempAcceleration -= 1;

                setVelocity(tempVelocity);
                setAcceleration(tempAcceleration);

                if (tempVelocity <= 0 && tempAcceleration <= 0) {
                  clearInterval(toZeroInterval);

                  const toFiftyInterval = setInterval(() => {
                    tempVelocity += 1;
                    tempAcceleration += 1;

                    setVelocity(tempVelocity);
                    setAcceleration(tempAcceleration);

                    if (tempVelocity >= 50 && tempAcceleration >= 50) {
                      clearInterval(toFiftyInterval);
                      setIsAnimating(false);
                    }
                  }, 5);
                }
              }, 5);
            }
          }, 5);
        }
      }, 5);
    }
  }, [isConnected, connectionState]);

  // Debounced change handler for velocity
  const handleVelocityChange = (newVelocity: number) => {
    if (velocityTimeout) {
      clearTimeout(velocityTimeout); // Clear previous timeout if any
    }

    setVelocity(newVelocity); // Set new velocity state

    // Set a timeout to send the command after a delay (300ms here)
    const timeout = setTimeout(() => {
      if (isConnected) {
        setAPIVelocity(port!, newVelocity); // Send velocity command
      }
    }, 300); // Adjust delay as needed
    setVelocityTimeout(timeout); // Store the timeout ID to clear it if needed
  };

  // Debounced change handler for acceleration
  const handleAccelerationChange = (newAcceleration: number) => {
    if (accelerationTimeout) {
      clearTimeout(accelerationTimeout); // Clear previous timeout if any
    }

    setAcceleration(newAcceleration); // Set new acceleration state

    // Set a timeout to send the command after a delay (300ms here)
    const timeout = setTimeout(() => {
      if (isConnected) {
        setAPIacceleration(port!, newAcceleration); // Send acceleration command
      }
    }, 300); // Adjust delay as needed
    setAccelerationTimeout(timeout); // Store the timeout ID to clear it if needed
  };

  // Velocity slider change handler
  const handleVelocitySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVelocity = Number(e.target.value);
    handleVelocityChange(newVelocity);
  };

  // Acceleration slider change handler
  const handleAccelerationSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAcceleration = Number(e.target.value);
    handleAccelerationChange(newAcceleration);
  };

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
            onChange={handleAccelerationSliderChange} // Call the debounced change handler
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
            onChange={handleVelocitySliderChange} // Call the debounced change handler
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
