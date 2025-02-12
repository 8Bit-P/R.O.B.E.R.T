import React, { createContext, useState, useContext, ReactNode } from "react";
import { ConnectionStates } from "../constants/connectionConstants";
import { disconnectFromActiveConnectionAPI } from "../api/commands";
import toast from "react-hot-toast";

// Define the types for the context value
interface ConnectionContextType {
  port: string | null;
  isConnected: boolean;
  connectionState: ConnectionStates;
  setConnectionState: (status: ConnectionStates) => void;
  connectToPort: (port: string) => void;
  disconnectPort: () => void;
  setIsConnected: (value: boolean) => void;
}

// Initialize the context with default values
const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined
);

// Custom hook to use the ConnectionContext
export const useConnection = (): ConnectionContextType => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};

// Define the props for the provider
interface ConnectionProviderProps {
  children: ReactNode;
}

// The provider component that will wrap the app and manage the connection state
export const ConnectionProvider: React.FC<ConnectionProviderProps> = ({
  children,
}) => {
  const [port, setPort] = useState<string | null>("Select a port");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState(
    ConnectionStates.NOT_PROBED
  );

  const connectToPort = (newPort: string) => {
    setPort(newPort);
  };

  const disconnectPort = () => {
    disconnectFromActiveConnectionAPI()
      .then((res) => console.log(res))
      .catch((err) => toast.error(err));

    setPort(null);
    setIsConnected(false);
  };

  return (
    <ConnectionContext.Provider
      value={{
        port,
        isConnected,
        connectionState,
        setConnectionState,
        connectToPort,
        disconnectPort,
        setIsConnected,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
