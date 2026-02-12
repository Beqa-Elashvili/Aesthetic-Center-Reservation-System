import { Request, Response } from "express";
import { Reservation } from "@/models/reservation/Reservation";
import { Service } from "@/models/service/Service";
import { Op } from "sequelize";

// Get reservations for a date
export const getReservations = async (req: Request, res: Response) => {
  const { date } = req.query;
  const reservations = await Reservation.findAll({
    where: { date },
    include: [Service],
    order: [["startTime", "ASC"]],
  });
  res.json(reservations);
};

// Add reservation
export const addReservation = async (req: Request, res: Response) => {
  try {
    const { date, startTime, duration, specialistId, services } = req.body;

    const [hours, minutes] = startTime.split(":").map(Number);
    const endDate = new Date(date);
    endDate.setHours(hours, minutes + duration);
    const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // Conflict check
    const conflict = await Reservation.findOne({
      where: {
        specialistId,
        date,
        [Op.or]: [
          { startTime: { [Op.between]: [startTime, endTime] } },
          { endTime: { [Op.between]: [startTime, endTime] } },
        ],
      },
    });
    if (conflict)
      return res.status(400).json({ message: "Time slot already booked" });

    const reservation = await Reservation.create({
      date,
      startTime,
      endTime,
      duration,
      specialistId,
    });

    if (services && services.length) {
      await reservation.setServices(services);
    }

    const savedReservation = await Reservation.findByPk(reservation.id, {
      include: Service,
    });
    res.json(savedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit reservation
export const editReservation = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { date, startTime, duration, specialistId, services } = req.body;
  const reservation = await Reservation.findByPk(id);
  if (!reservation)
    return res.status(404).json({ message: "Reservation not found" });

  const [hours, minutes] = startTime.split(":").map(Number);
  const endDate = new Date(date);
  endDate.setHours(hours, minutes + duration);
  const endTime = `${endDate.getHours().toString().padStart(2, "0")}:${endDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  reservation.date = date;
  reservation.startTime = startTime;
  reservation.endTime = endTime;
  reservation.duration = duration;
  reservation.specialistId = specialistId;
  await reservation.save();

  if (services && services.length) {
    await reservation.setServices(services);
  }

  const updated = await Reservation.findByPk(id, { include: Service });
  res.json(updated);
};

// Delete reservation
export const deleteReservation = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Reservation.destroy({ where: { id } });
  res.json({ message: "Reservation deleted" });
};
