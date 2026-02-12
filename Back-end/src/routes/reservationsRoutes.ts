import { Router } from "express";
import * as reservationsController from "@/controllers/reservationController";

const router = Router();

router.get("/", reservationsController.getReservations);
router.post("/", reservationsController.addReservation);
router.put("/:id", reservationsController.editReservation);
router.delete("/:id", reservationsController.deleteReservation);

export default router;
