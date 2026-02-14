import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import ModalComponent from "../ModalContents/ModalContent";
import { useGlobalContext } from "../providers/globalProviders";
import type {
  DateSelectArg,
  EventInput as FCEventInput,
} from "@fullcalendar/core";

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<FCEventInput[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");

  const { specialists, services } = useGlobalContext();

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
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        headerToolbar={false}
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }}
        allDaySlot={false}
        viewClassNames={"custom-calendar-view"}
        resources={specialists?.map((s) => ({
          id: s.id,
          title: s.firstName,
        }))}
        events={events}
        height="auto"
      />
      <ModalComponent
        type="reservation"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        data={{
          selectedSpecialist,
          selectedSlot,
          selectedServices,
        }}
        setData={(newData) => {
          setSelectedSpecialist(
            newData.selectedSpecialist ?? selectedSpecialist,
          );
          setSelectedSlot(newData.selectedSlot ?? selectedSlot);
          setSelectedServices(newData.selectedServices ?? selectedServices);
        }}
        specialists={specialists}
        services={services}
      />
    </div>
  );
};

export default SchedulePage;
