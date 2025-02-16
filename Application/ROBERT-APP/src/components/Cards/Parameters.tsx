import { useEffect, useState } from 'react';
import { useConnection } from '../../context/ConnectionContext';
import { useStepperContext } from '../../context/StepperContext';

const Parameters = () => {
  const { acceleration, velocity, setVelocity, setAcceleration } = useStepperContext();
  const { isConnected } = useConnection();

  // **Local state for sliders (prevents direct API calls)**
  const [sliderVelocity, setSliderVelocity] = useState(velocity);
  const [sliderAcceleration, setSliderAcceleration] = useState(acceleration);

  // Track if sliders have been modified
  const [isModified, setIsModified] = useState(false);

  // Track when the animation is complete (to trigger the API call)
  const [isAnimating, setIsAnimating] = useState(false);

  // Debounce timeout variables
  const [velocityTimeout, setVelocityTimeout] = useState<number | null>(null);
  const [accelerationTimeout, setAccelerationTimeout] = useState<number | null>(null);

  // Function to handle debounced API calls
  const debouncedApiCall = (value: number, type: 'velocity' | 'acceleration') => {
    const timeout = setTimeout(() => {
      if (type === 'velocity') {
        setVelocity(value); // Trigger velocity API call
      } else {
        setAcceleration(value); // Trigger acceleration API call
      }
    }, 500); // Wait 500ms after the user stops changing the slider value

    if (type === 'velocity') {
      setVelocityTimeout(timeout);
    } else {
      setAccelerationTimeout(timeout);
    }
  };

  // Animation function to gradually change the value
  const animateSlider = (targetValue: number, setter: React.Dispatch<React.SetStateAction<number>>, currentValue: number, onComplete: () => void) => {
    const step = targetValue > currentValue ? 1 : -1; // Determine direction of change
    const interval = setInterval(() => {
      if ((step > 0 && currentValue >= targetValue) || (step < 0 && currentValue <= targetValue)) {
        clearInterval(interval); // Stop the interval once we reach the target value
        onComplete(); // Notify that the animation is complete
      } else {
        currentValue += step;
        setter(currentValue); // Update the slider value
      }
    }, 10); // Update every 10ms for smooth animation
  };

  //Trigger animations on connect
  useEffect(() => {
    // Animate the sliders to the retrieved values (velocity and acceleration)
    if (isConnected) {
      setIsAnimating(true); // Start the animation
      animateSlider(velocity, setSliderVelocity, sliderVelocity, () => {
        setIsAnimating(false); // Set animation complete when finished
      });
      animateSlider(acceleration, setSliderAcceleration, sliderAcceleration, () => {
        setIsAnimating(false); // Set animation complete when finished
      });
    }
  }, [velocity, acceleration, isConnected]); // Runs when the velocity or acceleration values are updated

  // Sync local state with context
  useEffect(() => {
    setSliderVelocity(velocity); 
    setSliderAcceleration(acceleration);
  }, [velocity, acceleration]);

  // **Velocity effect with debouncing**
  useEffect(() => {
    if (isConnected && isModified && !isAnimating) {
      if (velocityTimeout) {
        clearTimeout(velocityTimeout); // Clear previous timeout
      }
      debouncedApiCall(sliderVelocity, 'velocity');
    }
  }, [sliderVelocity, isConnected, isModified, isAnimating]);

  // **Acceleration effect with debouncing**
  useEffect(() => {
    if (isConnected && isModified && !isAnimating) {
      if (accelerationTimeout) {
        clearTimeout(accelerationTimeout); // Clear previous timeout
      }
      debouncedApiCall(sliderAcceleration, 'acceleration');
    }
  }, [sliderAcceleration, isConnected, isModified, isAnimating]);

  // Handlers for UI updates
  const handleVelocityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderVelocity(Number(e.target.value));
    setIsModified(true); // Mark as modified when slider is changed
  };

  const handleAccelerationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderAcceleration(Number(e.target.value));
    setIsModified(true); // Mark as modified when slider is changed
  };

  return (
    <div className="space-y-4 p-4 pl-2">
      <div className="flex flex-col space-y-4">
        {/* Acceleration Slider */}
        <div className="flex items-center">
          <label className="w-28 font-semibold">Acceleration</label>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderAcceleration}
            onChange={handleAccelerationChange}
            className="w-[150px] h-1 ml-2 appearance-none bg-gray-300 bg-dotted-slider rounded-md"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #E5E7EB, #E5E7EB 2px, transparent 2px, transparent 5px)',
              outline: 'none',
            }}
          />
          <span className="ml-2 w-8 text-center">{sliderAcceleration}</span>
        </div>

        {/* Velocity Slider */}
        <div className="flex items-center">
          <label className="w-28 font-semibold">Velocity</label>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderVelocity}
            onChange={handleVelocityChange}
            className="w-[150px] h-1 ml-11 appearance-none bg-gray-300 bg-dotted-slider rounded-md"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, #E5E7EB, #E5E7EB 2px, transparent 2px, transparent 5px)',
              outline: 'none',
            }}
          />
          <span className="ml-2 w-8 text-center">{sliderVelocity}</span>
        </div>
      </div>
    </div>
  );
};

export default Parameters;
