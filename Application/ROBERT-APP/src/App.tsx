import "./App.css";
import Card from "./components/Card";
import Calibration from "./components/Cards/Calibration";
import Connection from "./components/Cards/Connection";
import Joints from "./components/Cards/Joints";
import Parameters from "./components/Cards/Parameters";
import SteppersState from "./components/Cards/SteppersState";

function App() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-5" style={{ fontFamily: 'nothing' }}>
        R.O.B.E.R.T - Dashboard
      </h1>

      <div className="grid gap-1 gap-y-1" style={{ gridTemplateColumns: 'repeat(14, 50px)', gridTemplateRows:'repeat(14, 50px)'  }}>
        <div className="col-span-4 row-span-4">
          <Card width={200} height={200} title={"Enable Steppers"} children={<SteppersState />} />
        </div>
        <div className="col-span-4 row-span-3">
          <Card width={200} height={150} title={"Connection"} children={<Connection />} />
        </div>
        <div className="col-span-6 row-span-3">
          <Card width={300} height={150} title={"Parameters"} children={<Parameters />} />
        </div>
        <div className="col-span-4 row-span-8">
          <Card width={200} height={400} title={"Calibration"} children={<Calibration />} />
        </div>
        <div className="col-span-6 row-span-6">
          <Card width={300} height={300} title={"Joints"} children={<Joints />} />
        </div>
      </div>
    </main>
  );
}

export default App;
