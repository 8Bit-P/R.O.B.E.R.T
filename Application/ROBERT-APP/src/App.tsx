import './App.css';
import Card from './components/Card';
import Calibration from './components/Cards/MainDashboard/Calibration';
import Connection from './components/Cards/MainDashboard/Connection';
import JointControl from './components/Cards/MainDashboard/JointControl';
import Joints from './components/Cards/MainDashboard/Joints';
import Parameters from './components/Cards/MainDashboard/Parameters';
import EnableSteppers from './components/Cards/MainDashboard/EnableSteppers';
import RecordMovements from './components/Cards/MainDashboard/RecordMovements';
import Simulation from './components/Cards/Kinematics/Simulation';

import { ConnectionProvider } from './context/ConnectionContext';
import { Toaster } from 'react-hot-toast';
import { StepperProvider } from './context/StepperContext';

function App() {
  return (
    <StepperProvider>
      <ConnectionProvider>
        <Toaster position="top-right" reverseOrder={false} />

        <main className="flex flex-col items-center justify-center ">
          <div className="w-[1060px]">
            <div className="flex items-center justify-between mb-5 mt-10" style={{ fontFamily: 'nothing' }}>
              <h1 className="text-3xl font-bold">R.O.B.E.R.T - Dashboard</h1>
              <h1 className="text-3xl font-bold">8Bit-P</h1>
            </div>
          </div>

          <div className="w-[1060px] grid gap-1 gap-y-1 mt-[60px]" style={{ gridTemplateColumns: 'repeat(20, 50px)', gridTemplateRows: 'repeat(12, 50px)' }}>
            <div className="col-span-6 row-span-6">
              <Card width={300} height={300} title={'Joints'} children={<Joints />} />
            </div>
            <div className="col-span-4 row-span-3">
              <Card width={200} height={150} title={'Connection'} children={<Connection />} />
            </div>
            <div className="col-span-6 row-span-3">
              <Card width={300} height={150} title={'Parameters'} children={<Parameters />} />
            </div>
            <div className="col-span-4 row-span-4">
              <Card width={200} height={200} title={'Enable Steppers'} children={<EnableSteppers />} />
            </div>
            <div className="col-span-10 row-span-9 mt-2">
              <Card width={515} height={455} title={'Joint Control'} children={<JointControl />} />
            </div>
            <div className="col-span-4 row-span-8 mt-2">
              <Card width={200} height={400} title={'Calibration'} children={<Calibration />} />
            </div>
            <div className="col-span-6 row-span-6">
              <Card width={300} height={300} title={'Recorded movements'} children={<RecordMovements />} />
            </div>
          </div>

          <div className="w-[1060px] text-left mt-10">
            <h2 className="text-3xl font-bold" style={{ fontFamily: 'nothing' }}>
              Kinematics
            </h2>
          </div>

          <div className="w-[1060px] grid gap-1 gap-y-1 mt-[60px]" style={{ gridTemplateColumns: 'repeat(20, 50px)', gridTemplateRows: 'repeat(12, 50px)' }}>
            <div className="col-span-12 row-span-12">
              <Card width={600} height={600} title={'Simulation'} children={<Simulation/>} />
            </div>

            <div className="col-span-6 row-span-6">
              <Card width={415} height={300} title={'Kinematics control'} children={<></>} />
            </div>

            <div className="col-span-6 row-span-6">
              <Card width={415} height={275} title={'Kinematics control'} children={<></>} />
            </div>
          </div>
        </main>
      </ConnectionProvider>
    </StepperProvider>
  );
}

export default App;
