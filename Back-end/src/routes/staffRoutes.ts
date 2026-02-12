import { Router } from "express";
import * as staffController from "@/controllers/staffController";

const router = Router();

router.get("/", staffController.getStaff);
router.post("/", staffController.addStaff);
router.put("/:id", staffController.editStaff);
router.delete("/:id", staffController.deleteStaff);

export default router;
