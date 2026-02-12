import { Request, Response } from "express";
import { Specialist } from "../models/staf/Staf";
import { Op } from "sequelize";

export const getStaff = async (req: Request, res: Response) => {
  const { search } = req.query;
  const staff = await Specialist.findAll({
    where: search
      ? {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : undefined,
  });
  res.json(staff);
};

// Add staff
export const addStaff = async (req: Request, res: Response) => {
  const { firstName, lastName, photoUrl } = req.body;
  const staff = await Specialist.create({ firstName, lastName, photoUrl });
  res.json(staff);
};

// Edit staff
export const editStaff = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { firstName, lastName, photoUrl } = req.body;
  const staff = await Specialist.findByPk(id);
  if (!staff) return res.status(404).json({ message: "Staff not found" });
  staff.firstName = firstName;
  staff.lastName = lastName;
  if (photoUrl) staff.photoUrl = photoUrl;
  await staff.save();
  res.json(staff);
};

// Delete staff
export const deleteStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Specialist.destroy({ where: { id } });
  res.json({ message: "Staff deleted" });
};
