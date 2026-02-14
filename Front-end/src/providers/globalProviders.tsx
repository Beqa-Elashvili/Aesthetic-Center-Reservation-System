import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
} from "react";
import axios from "axios";

export interface TSpecialist {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TService {
  id: string;
  name: string;
  price: number;
  color: string;
  type: string;
}

interface GlobalContextType {
  specialists: TSpecialist[];
  services: TService[];
  setSpecialistMap: Dispatch<SetStateAction<TSpecialist[]>>;
  setServices: (services: TService[]) => void;
  fetchSpecialists: () => Promise<void>;
  fetchServices: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [specialists, setSpecialistMap] = useState<TSpecialist[]>([]);
  const [services, setServices] = useState<TService[]>([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/services`,
      );
      const data = await res.data;
      setServices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/staff`);
      const data = res.data;
      setSpecialistMap(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchSpecialists();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        specialists,
        services,
        setSpecialistMap,
        setServices,
        fetchSpecialists,
        fetchServices,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
