import { useEffect, useState } from "react";
import toast from 'react-hot-toast';
import ToggleInput from "../ToggleInput";

const Connection = () => {
  const enum ConnectionStates {
    REFUSED_CONNECTION = "#FD0200",
    ACCEPTED_CONNECTION = "#69B59E",
    NOT_PROBED = "#6B7280",
    PROBING = "#EA580C",
  }

  const invoke = window.__TAURI__.core.invoke;

  const [isConnected, setIsConnected] = useState(false);
  const [port, setPort] = useState("Select a port");
  const [ports, setPorts] = useState<string[]>([]); //Available ports
  const [connectionState, setConnectionState] = useState(
    ConnectionStates.NOT_PROBED
  );

  // Retrieve available ports on start
  useEffect(() => {
    refreshPorts();
  }, []);

  const refreshPorts = () => {
    invoke<string[]>("get_ports")
      .then((response) => {
        setPorts(response); // Set the response directly as the new state
      })
      .catch((error) => console.error("Failed to get ports:", error));
  };

  const handleChangePort = (e: any) => {
    //Disconnect if connected previously
    setIsConnected(false);
    setConnectionState(ConnectionStates.NOT_PROBED);
    setPort(e.target.value);
  };

  const handleToggleConnection = async () => {
    // Toggle the connection state
    setIsConnected(!isConnected);
  
    // Only perform the operation when the user tries to enable the connection
    if (!isConnected) {
      try {
        // Set loading state while the connection is being attempted
        setConnectionState(ConnectionStates.PROBING);
  
        // Invoke the connection command asynchronously
        const response = await invoke<string[]>("connect_to_port", { port });
  
        // Show the response in a toast (converted to string for display)
        toast(response.toString());

        setConnectionState(ConnectionStates.ACCEPTED_CONNECTION);
      } catch (error) {
        // Log the error and show an error toast
        toast(`Error trying to connect to port: ${error}`);

        setConnectionState(ConnectionStates.REFUSED_CONNECTION);
        setIsConnected(false);
        setPort("Select a port");
      } 
    }
  };

  return (
    <div className="ml-2" style={{ fontFamily: "nothing" }}>
      <div className="flex items-center justify-start space-x-4 w-full">
        <form className="mb-2 mt-2">
          <select
            onClick={refreshPorts}
            onChange={handleChangePort}
            defaultValue={"default"}
            id="countries"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-100px p-2.5 select-none"
          >
            <option value="default">Select a port</option>
            {ports.map((portItem) => (
              <option key={portItem} value={portItem}>
                {portItem}
              </option>
            ))}
          </select>
        </form>

        {/* Status indicator dot */}
        <div
          className="w-2 h-2 bg-gray-500 rounded-full"
          style={{ backgroundColor: connectionState }}
        />
      </div>

      <div className="inline-flex items-center">
        <ToggleInput
          isChecked={isConnected}
          handleToggleInput={handleToggleConnection}
        />
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
