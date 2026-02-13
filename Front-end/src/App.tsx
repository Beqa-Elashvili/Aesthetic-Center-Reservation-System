import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import { Modal, Button, Select } from "antd";

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
        title="New Reservation"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        okText="Save"
        centered
        cancelText="Cancel"
      >
        <p>
          <strong>Specialist:</strong>{" "}
          {specialists.find((s) => s.id === selectedSpecialist)?.name ||
            "Unknown"}
        </p>

        <p>
          <strong>Date:</strong> {selectedSlot?.startStr.split("T")[0]}
        </p>

        <p>
          <strong>Time:</strong>{" "}
          {selectedSlot?.startStr.split("T")[1].substring(0, 5)}
        </p>

        <div className="mt-4">
          <label className="block mb-2 font-medium">Select Services:</label>

          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select services"
            value={selectedServices}
            onChange={(value) => setSelectedServices(value)}
            options={services.map((s) => ({
              label: s.name,
              value: s.id,
            }))}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SchedulePage;
