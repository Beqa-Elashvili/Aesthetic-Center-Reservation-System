import { Request, Response } from "express";
import { Reservation } from "@/models/reservation/Reservation";
import { Service } from "@/models/service/Service";
import { Specialist } from "@/models/staf/Staf";
import { Op } from "sequelize";

export const getReservations = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    const whereCondition: any = {};
    if (date) {
      whereCondition.date = date;
    }

    const reservations = await Reservation.findAll({
      where: whereCondition,
      include: [
        {
          model: Service,
          attributes: ["id", "name", "color", "type", "price"],
        },
        {
          model: Specialist,
          attributes: ["id", "firstName", "lastName", "photoUrl"],
        },
      ],
      order: [
        ["date", "ASC"],
        ["startTime", "ASC"],
      ],
    });

    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Add reservation =====
export const addReservation = async (req: Request, res: Response) => {
  try {
    const { date, startTime, duration, specialistId, services } = req.body;

    if (!date || !startTime || !duration || !specialistId)
      return res.status(400).json({ message: "Missing required fields" });

    // Calculate end time
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    const endTime = endDateTime.toTimeString().slice(0, 5); // HH:mm

    // Check for overlapping reservations
    const conflict = await Reservation.findOne({
      where: {
        specialistId,
        date,
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } },
        ],
      },
    });

    if (conflict)
      return res.status(400).json({ message: "Time slot already booked" });

    // Create reservation
    const reservation = await Reservation.create({
      date,
      startTime,
      endTime,
      duration,
      specialistId,
    });

    // Associate services if any
    if (services && services.length) {
      const validServices = await Service.findAll({
        where: { id: services },
      });
      await reservation.setServices(validServices);
    }

    // Return the saved reservation with associations
    const savedReservation = await Reservation.findByPk(reservation.id, {
      include: [
        {
          model: Service,
          attributes: ["id", "name", "color", "type", "price"],
        },
        {
          model: Specialist,
          attributes: ["id", "firstName", "lastName", "photoUrl"],
        },
      ],
    });

    res.json(savedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Edit reservation =====
export const editReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, startTime, duration, specialistId, services } = req.body;

    const reservation = await Reservation.findByPk(id as string);
    if (!reservation)
      return res.status(404).json({ message: "Reservation not found" });

    // Calculate end time
    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);

    const endTime = endDateTime.toTimeString().slice(0, 5); // HH:mm

    // Check for conflicts excluding current reservation
    const conflict = await Reservation.findOne({
      where: {
        specialistId,
        date,
        id: { [Op.ne]: id },
        [Op.and]: [
          { startTime: { [Op.lt]: endTime } },
          { endTime: { [Op.gt]: startTime } },
        ],
      },
    });

    if (conflict)
      return res.status(400).json({ message: "Time slot already booked" });

    // Update reservation
    reservation.date = date;
    reservation.startTime = startTime;
    reservation.endTime = endTime;
    reservation.duration = duration;
    reservation.specialistId = specialistId;
    await reservation.save();

    // Update services
    if (services && services.length) {
      const validServices = await Service.findAll({
        where: { id: services },
      });
      await reservation.setServices(validServices);
    }

    const updatedReservation = await Reservation.findByPk(id as string, {
      include: [
        {
          model: Service,
          attributes: ["id", "name", "color", "type", "price"],
        },
        {
          model: Specialist,
          attributes: ["id", "firstName", "lastName", "photoUrl"],
        },
      ],
    });

    res.json(updatedReservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===== Delete reservation =====
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reservation = await Reservation.findByPk(id as string);
    if (!reservation)
      return res.status(404).json({ message: "Reservation not found" });

    await reservation.destroy();
    res.json({ message: "Reservation deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
