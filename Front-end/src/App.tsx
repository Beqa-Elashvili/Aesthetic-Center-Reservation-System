import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import Modal from "react-modal";

import type {
  DateSelectArg,
  EventInput as FCEventInput,
} from "@fullcalendar/core";

interface Specialist {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  color?: string;
}

interface Reservation {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  specialistId: string;
  services: Service[];
}

const specialists: Specialist[] = [
  { id: "1", name: "Giorgi" },
  { id: "2", name: "Nino" },
  { id: "3", name: "Luka" },
  { id: "4", name: "Mariam" },
];

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<FCEventInput[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");

  const fetchReservations = async () => {
    try {
      const res = await axios.get("/api/reservations");
      const eventsFromBackend: FCEventInput[] = res.data.map((r: any) => ({
        id: r.id,
        title: r.services.map((s: any) => s.name).join(", "),
        start: `${r.date}T${r.startTime}`,
        end: `${r.date}T${r.endTime}`,
        resourceId: r.specialistId,
        backgroundColor: r.services[0]?.color || "#3788d8",
      }));
      setEvents(eventsFromBackend);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get("/api/services");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // useEffect(() => {
  //   fetchReservations();
  //   fetchServices();
  // }, []);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedSlot(selectInfo);
    setSelectedSpecialist(selectInfo.resource?.id || "");
    setSelectedServices([]);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSlot || !selectedSpecialist || selectedServices.length === 0)
      return;

    const startDate = selectedSlot.startStr.split("T")[0];
    const startTime = selectedSlot.startStr.split("T")[1].substring(0, 5);

    const [hours, minutes] = startTime.split(":").map(Number);
    const endMinutes = minutes + 30;
    const endHour = hours + Math.floor(endMinutes / 60);
    const endMinute = endMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    try {
      await axios.post("/api/reservations", {
        date: startDate,
        startTime,
        endTime,
        duration: 30,
        specialistId: selectedSpecialist,
        services: selectedServices,
      });
      fetchReservations();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error saving reservation");
    }
  };

  return (
    <div>
      <FullCalendar
        plugins={[resourceTimeGridPlugin, interactionPlugin]}
        initialView="resourceTimeGridDay"
        selectable={true}
        select={handleDateSelect}
        slotDuration="00:30:00"
        allDaySlot={false}
        resources={specialists.map((s) => ({ id: s.id, title: s.name }))}
        events={events}
        height="auto"
      />

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Add Reservation"
        ariaHideApp={false}
      >
        <h2>New Reservation</h2>
        <p>
          Specialist:{" "}
          {specialists.find((s) => s.id === selectedSpecialist)?.name ||
            "Unknown"}
        </p>
        <p>Date: {selectedSlot?.startStr.split("T")[0]}</p>
        <p>Time: {selectedSlot?.startStr.split("T")[1].substring(0, 5)}</p>

        <div>
          <label>Select Services:</label>
          <select
            multiple
            value={selectedServices}
            onChange={(e) =>
              setSelectedServices(
                Array.from(e.target.selectedOptions, (option) => option.value),
              )
            }
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleSave}>Save</button>
        <button onClick={() => setModalOpen(false)}>Cancel</button>
      </Modal>
    </div>
  );
};

export default SchedulePage;
