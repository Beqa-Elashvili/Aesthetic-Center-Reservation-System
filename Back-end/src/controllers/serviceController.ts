import { Request, Response } from "express";
import { Service } from "@/models/service/Service";
import { ServiceCustomField } from "@/models/service/CustomFieldsService";
import { testConnection } from "@/config/db";

// Get all services with custom fields
export const getServices = async (req: Request, res: Response) => {
  const services = await Service.findAll({ include: ["customFields"] });
  res.json(services);
};

// Add service
export const addService = async (req: Request, res: Response) => {
  const { name, price, color, customFields } = req.body;
  const service = await Service.create({ name, price, color });
  if (customFields && customFields.length) {
    for (const field of customFields) {
      await ServiceCustomField.create({
        serviceId: service.id,
        fieldName: field.name,
        value: field.value,
      });
    }
  }
  const savedService = await Service.findByPk(service.id, {
    include: ["customFields"],
  });
  res.json(savedService);
};

// Edit service
export const editService = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name, price, color, customFields } = req.body;
  const service = await Service.findByPk(id);
  if (!service) return res.status(404).json({ message: "Service not found" });

  service.name = name;
  service.price = price;
  service.color = color;
  await service.save();

  if (customFields && customFields.length) {
    await ServiceCustomField.destroy({ where: { serviceId: id } });
    for (const field of customFields) {
      await ServiceCustomField.create({
        serviceId: id,
        fieldName: field.name,
        value: field.value,
      });
    }
  }

  const updatedService = await Service.findByPk(id, {
    include: ["customFields"],
  });
  res.json(updatedService);
};

// Delete service
export const deleteService = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Service.destroy({ where: { id } });
  await ServiceCustomField.destroy({ where: { serviceId: id } });
  res.json({ message: "Service deleted" });
};
