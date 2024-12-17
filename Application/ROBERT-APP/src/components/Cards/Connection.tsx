import { useEffect, useState } from "react";
import { useConnection } from "../../context/ConnectionContext";
import { getPorts, connectToPortAPI } from "../../api/commands";
import { ConnectionStates, DEFAULT_PORT_LABEL } from "../../constants/connectionConstants";

import toast from 'react-hot-toast';
import ToggleInput from "../ToggleInput";

const Connection = () => {
  const [ports, setPorts] = useState<string[]>([]); // Available ports
  
  const { port, setIsConnected, isConnected,connectionState, setConnectionState, connectToPort, disconnectPort } = useConnection();

  // Retrieve available ports on start
  useEffect(() => {
    refreshPorts();
  }, []);

  const refreshPorts = async () => {
    try {
      const response = await getPorts();
      setPorts(response);
    } catch (error) {
      toast.error(`Failed to get ports: ${error}`);
    }
  };

  const handleChangePort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    disconnectPort();
    setConnectionState(ConnectionStates.NOT_PROBED);
    connectToPort(e.target.value);
  };

  const handleToggleConnection = async () => {
    setIsConnected(!isConnected);

    if (!isConnected) {
      try {
        setConnectionState(ConnectionStates.PROBING);

        const response = await connectToPortAPI(port!);

        toast.success(response.toString());
        setConnectionState(ConnectionStates.ACCEPTED_CONNECTION);
      } catch (error) {
        toast.error(`Error trying to connect to port: ${error}`);
        setConnectionState(ConnectionStates.REFUSED_CONNECTION);
        setIsConnected(false);
      }
    } else {
      setConnectionState(ConnectionStates.NOT_PROBED);
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
            <option value="default">{DEFAULT_PORT_LABEL}</option>
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
          isActive={true}
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
