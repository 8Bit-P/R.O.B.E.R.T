import "./App.css";
import Card from "./components/Card";
import Calibration from "./components/Cards/Calibration";
import Connection from "./components/Cards/Connection";
import JointControl from "./components/Cards/JointControl";
import Joints from "./components/Cards/Joints";
import Parameters from "./components/Cards/Parameters";
import RecordPositions from "./components/Cards/RecordPositions";
import EnableSteppers from "./components/Cards/EnableSteppers";

import { ConnectionProvider } from "./context/ConnectionContext";
import { Toaster } from "react-hot-toast";
import { StepperProvider } from "./context/StepperContext";

function App() {
  return (
    <StepperProvider>
      <ConnectionProvider>
        <Toaster position="top-right" reverseOrder={false}/>
        
        <main className="flex flex-col items-center justify-center ">
          <div className="w-[1060px]">
            <div className="flex items-center justify-between mb-5 mt-10">
              <h1 className="text-3xl font-bold" style={{ fontFamily: "nothing" }}>
                R.O.B.E.R.T - Dashboard
              </h1>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "nothing" }}>
                8Bit-P
              </h1>
            </div>
          </div>

          <div className="grid gap-1 gap-y-1 mt-[60px]" style={{gridTemplateColumns: "repeat(20, 50px)",gridTemplateRows: "repeat(12, 50px)",}} >
            <div className="col-span-6 row-span-6">
              <Card width={300} height={300}  title={"Joints"} children={<Joints />} />
            </div>
            <div className="col-span-4 row-span-3">
              <Card width={200}  height={150} title={"Connection"} children={<Connection />} />
            </div>
            <div className="col-span-6 row-span-3">
              <Card width={300} height={150} title={"Parameters"} children={<Parameters />}
              />
            </div>
            <div className="col-span-4 row-span-4">
              <Card width={200} height={200} title={"Enable Steppers"} children={<EnableSteppers />}
              />
            </div>
            <div className="col-span-10 row-span-9 mt-2">
              <Card width={515} height={455} title={"Joint Control"} children={<JointControl />}
              />
            </div>
            <div className="col-span-4 row-span-8 mt-2">
              <Card width={200} height={400} title={"Calibration"} children={<Calibration />}
              />
            </div>
            <div className="col-span-6 row-span-6">
              <Card width={300} height={300} title={"Record positions"} children={<RecordPositions />}
              />
            </div>
          </div>
        </main>
      </ConnectionProvider>
    </StepperProvider>
  );
}

export default App;
