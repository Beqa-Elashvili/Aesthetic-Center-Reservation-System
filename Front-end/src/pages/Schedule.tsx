import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import ModalComponent from "../ModalContents/ModalContent";
import { useGlobalContext } from "../providers/globalProviders";
import type { DateSelectArg } from "@fullcalendar/core";

const SchedulePage: React.FC = () => {
  const { specialists, services } = useGlobalContext();

  const [modalOpen, setModalOpen] = useState(false);
  const { fetchReservations, events, setEvents } = useGlobalContext();

  const [selectedSlot, setSelectedSlot] = useState<DateSelectArg | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [savedServices, setSavedServices] = useState<any[]>([]);
  const [duration, setDuration] = useState<number>(30);
  const [editingReservationId, setEditingReservationId] = useState<
    string | null
  >(null);

  // = CREATE / EDIT RESERVATION =
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setEditingReservationId(null);
    setSelectedSlot(selectInfo);
    setSelectedSpecialist(selectInfo.resource?.id || "");
    setSelectedServices([]);
    setSavedServices([]);
    setDuration(30);
    setModalOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const event = events.find((e) => e.id === clickInfo.event.id);
    if (!event) return;

    const r = event.rawData;

    setEditingReservationId(event.id as string);
    setSelectedSpecialist(r.specialistId);
    setSelectedServices([]);
    setSavedServices(r.Services || []);
    setDuration(r.duration || 30);
    setSelectedSlot({
      startStr: `${r.date}T${r.startTime}`,
      endStr: `${r.date}T${r.endTime}`,
      resource: { id: r.specialistId },
    } as DateSelectArg);

    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSlot || !selectedSpecialist) return;

    const startDate = selectedSlot.startStr.split("T")[0];
    const [startHour, startMinute] = selectedSlot.startStr
      .split("T")[1]
      .substring(0, 5)
      .split(":")
      .map(Number);

    // calculate endTime
    const endTotalMinutes = startHour * 60 + startMinute + duration;
    const endHour = Math.floor(endTotalMinutes / 60);
    const endMinute = endTotalMinutes % 60;
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
      .toString()
      .padStart(2, "0")}`;

    // send only service IDs
    const allServiceIds = [
      ...savedServices.map((s) => s.id),
      ...selectedServices,
    ];

    try {
      if (editingReservationId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/reservations/${editingReservationId}`,
          {
            date: startDate,
            startTime: `${startHour.toString().padStart(2, "0")}:${startMinute
              .toString()
              .padStart(2, "0")}`,
            endTime,
            specialistId: selectedSpecialist,
            services: allServiceIds,
            duration,
          },
        );
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/reservations`, {
          date: startDate,
          startTime: `${startHour.toString().padStart(2, "0")}:${startMinute
            .toString()
            .padStart(2, "0")}`,
          endTime,
          specialistId: selectedSpecialist,
          services: allServiceIds,
          duration,
        });
      }

      setModalOpen(false);
      setEditingReservationId(null);
      setSelectedSlot(null);
      setSelectedSpecialist("");
      setSelectedServices([]);
      setSavedServices([]);
      setDuration(30);
      await fetchReservations();
    } catch (err: unknown) {
      alert(
        (err as any)?.response?.data?.message || "Error saving reservation",
      );
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
        fetchReservations={fetchReservations}
        editingReservationId={editingReservationId || undefined}
        data={{
          selectedSpecialist,
          selectedSlot,
          selectedServices,
          savedServices,
          duration,
        }}
        setData={(newData) => {
          setSelectedSpecialist(
            newData.selectedSpecialist ?? selectedSpecialist,
          );
          setSelectedSlot(newData.selectedSlot ?? selectedSlot);
          setSelectedServices(newData.selectedServices ?? selectedServices);
          setSavedServices(newData.savedServices ?? savedServices);
          setDuration(newData.duration ?? duration);
        }}
        specialists={specialists}
        services={services}
      />
    </div>
  );
};

export default SchedulePage;
