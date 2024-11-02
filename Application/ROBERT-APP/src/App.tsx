import "./App.css";
import Card from "./components/Card";
import Connection from "./components/Cards/Connection";
import Parameters from "./components/Cards/Parameters";
import SteppersState from "./components/Cards/SteppersState";

function App() {
  return (
    <main className="container">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>

      <div className="grid grid-cols-3 mt-5 w-[650px]">
        <Card width={200} height={200} title={"Enable Steppers"} children={<SteppersState/>}/>
        <Card width={200} height={150} title={"Connection"} children={<Connection/>}/>
        <Card width={200} height={150} title={"Parameters"} children={<Parameters/>}/>
      </div>
    </main>
  );
}

export default App;
