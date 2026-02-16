import React, { useEffect, useState } from "react";
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
  const { specialists, services } = useGlobalContext();

  const [events, setEvents] = useState<FCEventInput[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(30); // duration in minutes
  const [editingReservationId, setEditingReservationId] = useState<
    string | null
  >(null);

  // ================= FETCH RESERVATIONS =================
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
    fetchReservations();
  }, []);

  // ================= CREATE / EDIT RESERVATION =================
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setEditingReservationId(null);
    setSelectedSlot(selectInfo);
    setSelectedSpecialist(selectInfo.resource?.id || "");
    setSelectedServices([]);
    setDuration(30); // default duration
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find((e) => e.id === clickInfo.event.id);
    if (!event) return;

    const r = event.rawData;

    setEditingReservationId(event.id as string);
    setSelectedSpecialist(r.specialistId);
    setSelectedServices(r.services || []);
    setDuration(r.duration || 30);
    setSelectedSlot({
      startStr: `${r.date}T${r.startTime}`,
      endStr: `${r.date}T${r.endTime}`,
      resource: { id: r.specialistId },
    } as DateSelectArg);

    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSlot || !selectedSpecialist || selectedServices.length === 0)
      return;

    const startDate = selectedSlot.startStr.split("T")[0];
    const [startHour, startMinute] = selectedSlot.startStr
      .split("T")[1]
      .substring(0, 5)
      .split(":")
      .map(Number);

    // calculate endTime from start + duration
    const endTotalMinutes = startHour * 60 + startMinute + duration;
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    try {
      if (editingReservationId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/reservations/${editingReservationId}`,
          {
            date: startDate,
            startTime: `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`,
            endTime,
            specialistId: selectedSpecialist,
            services: selectedServices,
            duration,
          },
        );
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/reservations`, {
          date: startDate,
          startTime: `${startHour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`,
          endTime,
          specialistId: selectedSpecialist,
          services: selectedServices,
          duration,
        });
      }

      setModalOpen(false);
      setEditingReservationId(null);
      setSelectedSlot(null);
      setSelectedSpecialist("");
      setSelectedServices([]);
      setDuration(30);
      await fetchReservations();
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
        selectable
        select={handleDateSelect}
        eventClick={handleEventClick}
        slotDuration="00:30:00"
        slotMinTime="08:00:00"
        slotMaxTime="20:00:00"
        slotLabelFormat={{ hour: "2-digit", minute: "2-digit", hour12: false }}
        allDaySlot={false}
        viewClassNames="custom-calendar-view"
        resources={specialists?.map((s) => ({
          id: s.id,
          title: `${s.firstName} ${s.lastName}`,
          photoUrl: s.photoUrl
            ? `${import.meta.env.VITE_API_URL}${s.photoUrl}`
            : null,
        }))}
        resourceLabelContent={(arg) => {
          const resource: any = arg.resource;
          const photoUrl = resource.extendedProps?.photoUrl;
          return (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {photoUrl && (
                <img
                  src={photoUrl}
                  alt={resource.title}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
              <span
                style={{ fontWeight: 400, fontFamily: "Arial, sans-serif" }}
              >
                {resource.title}
              </span>
            </div>
          );
        }}
        events={events}
        height="auto"
      />

      <ModalComponent
        type="reservation"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        data={{ selectedSpecialist, selectedSlot, selectedServices, duration }}
        setData={(newData) => {
          setSelectedSpecialist(
            newData.selectedSpecialist ?? selectedSpecialist,
          );
          setSelectedSlot(newData.selectedSlot ?? selectedSlot);
          setSelectedServices(newData.selectedServices ?? selectedServices);
          setDuration(newData.duration ?? duration);
        }}
        specialists={specialists}
        services={services}
      />
    </div>
  );
};

export default SchedulePage;
