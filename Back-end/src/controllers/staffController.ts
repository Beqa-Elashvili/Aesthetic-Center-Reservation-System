import { Request, Response } from "express";
import { Specialist } from "../models/staf/Staf";
import { Op } from "sequelize";
import multer from "multer";
import path from "path";

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
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure 'uploads/' folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  },
});

export const upload = multer({ storage });

// Add staff
export const addStaff = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName } = req.body;
    const photoFile = req.file;

    if (!firstName || !lastName) {
      return res
        .status(400)
        .json({ message: "FirstName and LastName are required" });
    }

    const photoUrl = photoFile ? `/uploads/${photoFile.filename}` : "";

    const staff = await Specialist.create({ firstName, lastName, photoUrl });
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Edit staff
export const editStaff = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const staff = await Specialist.findByPk(id as string);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Text fields in req.body
    const firstName = req.body.firstName as string;
    const lastName = req.body.lastName as string;

    // File field
    const photoFile = req.files && (req.files as any).photo?.[0];

    if (firstName) staff.firstName = firstName;
    if (lastName) staff.lastName = lastName;
    if (photoFile) staff.photoUrl = `/uploads/${photoFile.filename}`;

    await staff.save();
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete staff
export const deleteStaff = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Specialist.destroy({ where: { id } });
  res.json({ message: "Staff deleted" });
};
