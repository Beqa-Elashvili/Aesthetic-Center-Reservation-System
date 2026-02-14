import { Router } from "express";
import * as staffController from "@/controllers/staffController";
import { upload } from "@/middleware/uploud";

const router = Router();

router.get("/", staffController.getStaff);
router.post("/", upload.single("photo"), staffController.addStaff);
router.put(
  "/:id",
  upload.fields([{ name: "photo", maxCount: 1 }]),
  staffController.editStaff,
);
router.delete("/:id", staffController.deleteStaff);

export default router;
