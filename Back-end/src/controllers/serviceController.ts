// src/controllers/serviceController.ts
import { Request, Response } from "express";
import { Service } from "@/models/service/Service";
import { ServiceCustomField } from "@/models/service/CustomFieldsService";

// Get all services
export const getServices = async (req: Request, res: Response) => {
  const { search } = req.query;
  const services = await Service.findAll({
    where: search
      ? { name: { [require("sequelize").Op.iLike]: `%${search}%` } }
      : undefined,
  });
  res.json(services);
};

// Add service
export const addService = async (req: Request, res: Response) => {
  try {
    const { name, price, color, type } = req.body;

    if (!name) return res.status(400).json({ message: "Name is required" });

    const service = await Service.create({ name, price, color, type });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit service
export const editService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, price, color, type } = req.body;

    const service = await Service.findByPk(id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (name) service.name = name;
    if (price) service.price = price;
    if (color) service.color = color;
    if (type) service.type = type;

    await service.save();
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete service
export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Service.destroy({ where: { id } });
    res.json({ message: "Service deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
