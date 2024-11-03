import { useState } from "react";
import ToggleInput from "../ToggleInput";

const Connection = () => {

  const enum ConnectionStates {
    REFUSED_CONNECTION = "#FD0200",
    ACCEPTED_CONNECTION = "#69B59E",
    NOT_PROBED = "gray-500" 
  }

  const [isConnected, setIsConnected] = useState(false);
  const [port, setPort] = useState("Select a port");
  const [connectionState, setConnectionState] = useState(ConnectionStates.NOT_PROBED)

  const handleChangePort = (e: any) => {
    //Disconnect if connected previously
    setIsConnected(false);
    setPort(e.target.value);

    //TODO: Handle connecting logic
  };

  const handleToggleConnection = () => {
    // Toggle connection state
    setIsConnected(!isConnected);
  };

  return (
    <div className="ml-2" style={{fontFamily:"nothing"}}>
      <div className="flex items-center justify-start space-x-4 w-full">
        <form className="mb-2 mt-2">
          <select
            onChange={handleChangePort}
            defaultValue={"default"}
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-100px p-2.5 select-none"
          >
            <option value="default">Select a port</option>
            <option value="COM3">COM3</option>
            <option value="COM2">COM2</option>
          </select>
        </form>

        {/* Status indicator dot */}
        <div className="w-2 h-2 bg-gray-500 rounded-full"  style={{backgroundColor: connectionState}}/>
      </div>

      <div className="inline-flex items-center">
        <ToggleInput isChecked={isConnected} handleToggleInput={handleToggleConnection}/>
        <span
          className="ms-3 text-sm font-medium"
          style={{ userSelect: "none" }}
        >
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
};

export default Connection;
