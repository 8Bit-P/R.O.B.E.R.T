import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import {
  ConnectionStates,
  DEFAULT_PORT_LABEL,
} from "../constants/connectionConstants";
import {
  getPorts,
  connectToPortAPI,
  disconnectFromActiveConnectionAPI,
} from "../api/commands";
import toast from "react-hot-toast";
import { useStepperContext } from "./StepperContext";

// Define the types for the context value
interface ConnectionContextType {
  port: string | null;
  isConnected: boolean;
  connectionState: ConnectionStates;
  availablePorts: string[];
  setConnectionState: (status: ConnectionStates) => void;
  refreshPorts: () => Promise<void>;
  connectToPort: (port: string) => Promise<void>;
  disconnectPort: () => void;
  setPort: (port: string | null) => void;
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
  const [port, setPort] = useState<string | null>(DEFAULT_PORT_LABEL);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionState, setConnectionState] = useState(ConnectionStates.NOT_PROBED);
  const [availablePorts, setAvailablePorts] = useState<string[]>([]);

  const { initializeSteppersInfo, resetStepperState } = useStepperContext();

  // Fetch ports on mount
  useEffect(() => {
    refreshPorts();
  }, []);

  // Function to refresh available ports
  const refreshPorts = async () => {
    try {
      const response = await getPorts();
      setAvailablePorts(response);
    } catch (error) {
      toast.error(`Failed to get ports: ${error}`);
    }
  };

  // Function to handle connecting to a port
  const connectToPort = async (newPort: string) => {
    if (newPort === "default" || newPort === "Select a port") return;

    setPort(newPort);
    setConnectionState(ConnectionStates.PROBING);

    try {
      const response = await connectToPortAPI(newPort);
      toast.success(response.toString());
      setIsConnected(true);
      setConnectionState(ConnectionStates.ACCEPTED_CONNECTION);

      // Fetch stepper state
      initializeSteppersInfo();
    } catch (error) {
      toast.error(`Error trying to connect to port: ${error}`);
      setIsConnected(false);
      setConnectionState(ConnectionStates.REFUSED_CONNECTION);
    }
  };

  // Function to disconnect from the port
  const disconnectPort = () => {
    if (port === null || !isConnected) return;

    disconnectFromActiveConnectionAPI()
      .then(() => {
        toast.success("Disconnected successfully");
        setIsConnected(false);
        setConnectionState(ConnectionStates.NOT_PROBED);
      })
      .catch((err) => toast.error(`Error disconnecting: ${err}`))
      .finally(() => {
        resetStepperState();
      });
  };

  return (
    <ConnectionContext.Provider
      value={{
        port,
        isConnected,
        connectionState,
        availablePorts,
        setConnectionState,
        refreshPorts,
        setPort,
        connectToPort,
        disconnectPort,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};
