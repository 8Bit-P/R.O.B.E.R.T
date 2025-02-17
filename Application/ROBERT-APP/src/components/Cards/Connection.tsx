import { useEffect } from "react";
import { useConnection } from "../../context/ConnectionContext";
import { ConnectionStates, DEFAULT_PORT_LABEL } from "../../constants/connectionConstants";
import ToggleInput from "../ToggleInput";

const Connection = () => {
  const {
    port,
    setPort,
    isConnected,
    connectionState,
    availablePorts,
    refreshPorts,
    connectToPort,
    disconnectPort
  } = useConnection();

  useEffect(() => {
    refreshPorts();
  }, []);

  const handleChangePort = (e: React.ChangeEvent<HTMLSelectElement>) => {
    disconnectPort();
    setPort(e.target.value);
  };

  return (
    <div className="ml-2" style={{ fontFamily: "nothing" }}>
      <div className="flex items-center justify-start space-x-4 w-full">
        <form className="mb-2 mt-2">
          <select
            onClick={refreshPorts}
            onChange={handleChangePort}
            defaultValue={port || "default"}
            id="ports"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-100px p-2.5 select-none"
          >
            <option value="default">{DEFAULT_PORT_LABEL}</option>
            {availablePorts.map((portItem) => (
              <option key={portItem} value={portItem}>
                {portItem}
              </option>
            ))}
          </select>
        </form>

        {/* Status indicator dot */}
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: connectionState }} />
      </div>

      <div className="inline-flex items-center">
        <ToggleInput
          isActive={connectionState !== ConnectionStates.PROBING}
          isChecked={isConnected}
          handleToggleInput={() => (isConnected ? disconnectPort() : connectToPort(port!))}
        />
        <span className="ms-3 text-sm font-medium" style={{ userSelect: "none" }}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>
    </div>
  );
};

export default Connection;
