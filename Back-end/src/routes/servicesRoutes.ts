import { Router } from "express";
import * as servicesController from "@/controllers/serviceController";

const router = Router();

router.get("/", servicesController.getServices);
router.post("/", servicesController.addService);
router.put("/:id", servicesController.editService);
router.delete("/:id", servicesController.deleteService);

export default router;
