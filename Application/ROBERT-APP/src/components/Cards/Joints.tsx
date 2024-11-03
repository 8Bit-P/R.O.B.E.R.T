import { useState } from "react";
import { FaGear } from "react-icons/fa6";

const Joints = () => {
  const [jointDegrees, setJointDegrees] = useState([0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);

  return (
    <div style={{ fontFamily: "nothing" }} className="grid p-4 pt-2 grid-cols-2 gap-x-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg mb-2">Joint</h2>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center space-x-2">
            <FaGear style={{color:"#333333"}}/>
            <h3>J{index + 1}</h3>
          </div>
        ))}
      </div>

      <div className="flex flex-col space-y-2">
        <h2 className="text-lg mb-2">Degree</h2>
        {jointDegrees.map((degree, index) => (
          <h3 key={index}>{degree}°</h3>
        ))}
      </div>
    </div>
  );
};

export default Joints;
