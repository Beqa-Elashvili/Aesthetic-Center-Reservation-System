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
import type { EventInput as FCEventInput } from "@fullcalendar/core";

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
  fetchReservations: () => Promise<void>;
  events: FCEventInput[];
  setEvents: React.Dispatch<React.SetStateAction<FCEventInput[]>>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [specialists, setSpecialistMap] = useState<TSpecialist[]>([]);
  const [services, setServices] = useState<TService[]>([]);
  const [events, setEvents] = useState<FCEventInput[]>([]);

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
      const data = await res.data;
      setSpecialistMap(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchReservations = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/reservations`,
      );
      const eventsFromBackend: FCEventInput[] = res.data.map((r: any) => ({
        id: r.id,
        title: r.Services?.map((s: any) => s.name).join(", ") || "No Service",
        start: `${r.date}T${r.startTime}`,
        end: `${r.date}T${r.endTime}`,
        resourceId: r.specialistId,
        backgroundColor: r.Services?.[0]?.color || "#3788d8",
        rawData: r,
      }));
      setEvents(eventsFromBackend);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchSpecialists();
    fetchReservations();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        specialists,
        fetchReservations,
        events,
        setEvents,
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
