import "./App.css";
import Card from "./components/Card";
import Connection from "./components/Cards/Connection";

function App() {
  return (
    <main className="container">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>

      <Card width={200} height={200} title={"Joints"} children={<Connection/>}/>
      <Card width={300} height={150} title={"Connection"} children={<Connection/>}/>
    </main>
  );
}

export default App;
